import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

import bcrypt from "bcryptjs";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import multer from "multer";

import {
  clearSessionCookie,
  createSession,
  requireAdmin,
  setSessionCookie,
} from "./auth.mjs";
import { config } from "./config.mjs";
import { initializeDatabase, pool } from "./db.mjs";
import { buildOrderEmail, createOrderEmailLog, deliverOrderEmail, handleResendWebhook } from "./email.mjs";
import { deleteImage, getImage, mediaUrl, uploadImage } from "./storage.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const outDirectory = path.resolve(currentDirectory, "../out");
const languageCodes = ["vi", "en", "zh-Hans", "zh-Hant"];
const fulfillmentModes = ["delivery", "pickup"];
const orderStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
const loginAttempts = new Map();
const storefrontCache = new Map();
const storefrontCacheTtlMs = 30_000;
let storefrontCacheVersion = 0;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 5 },
  fileFilter(_request, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("INVALID_IMAGE_TYPE"));
      return;
    }
    callback(null, true);
  },
});

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-origin" },
  contentSecurityPolicy: false,
}));
app.post("/api/webhooks/resend", express.raw({ type: "application/json", limit: "256kb" }), asyncRoute(async (request, response) => {
  const rawBody = request.body.toString("utf8");
  try {
    await handleResendWebhook(rawBody, {
      id: request.get("svix-id"),
      timestamp: request.get("svix-timestamp"),
      signature: request.get("svix-signature"),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "WebhookVerificationError") {
      return response.status(400).json({ error: "INVALID_WEBHOOK_SIGNATURE" });
    }
    throw error;
  }
  response.json({ received: true });
}));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api/admin", (request, response, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  const origin = request.get("origin");
  const allowedOrigins = new Set([config.appUrl, "http://localhost:3000", "http://127.0.0.1:3000"]);
  if (origin && !allowedOrigins.has(origin)) return response.status(403).json({ error: "INVALID_ORIGIN" });
  return next();
});

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function cleanText(value, maxLength, required = false) {
  const text = typeof value === "string" ? value.trim() : "";
  if (required && !text) throw new Error("REQUIRED_FIELD");
  if (text.length > maxLength) throw new Error("FIELD_TOO_LONG");
  return text || null;
}

function parseJsonField(request) {
  if (typeof request.body?.data !== "string") throw new Error("INVALID_FORM_DATA");
  try {
    return JSON.parse(request.body.data);
  } catch {
    throw new Error("INVALID_FORM_DATA");
  }
}

function validateLanguage(value) {
  return languageCodes.includes(value) ? value : "zh-Hans";
}

function validateSlug(value) {
  const slug = cleanText(value, 160, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("INVALID_SLUG");
  return slug;
}

function generateSlug(value, fallback) {
  const slug = value
    .normalize("NFD")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
  return slug || fallback;
}

async function createUniqueProductSlug(name) {
  const base = generateSlug(name, "san-pham");
  for (let index = 1; index <= 9999; index += 1) {
    const suffix = index === 1 ? "" : `-${index}`;
    const candidate = `${base.slice(0, 160 - suffix.length).replace(/-+$/g, "")}${suffix}`;
    const [rows] = await pool.execute("SELECT id FROM products WHERE slug = ? LIMIT 1", [candidate]);
    if (rows.length === 0) return candidate;
  }
  throw new Error("DUPLICATE_VALUE");
}

function validateCurrencyCode(value) {
  const code = cleanText(value, 3, true).toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw new Error("INVALID_CURRENCY_CODE");
  return code;
}

function validateTimezone(value) {
  const timezone = cleanText(value, 50, true);
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    throw new Error("INVALID_TIMEZONE");
  }
  return timezone;
}

function toPositiveId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("INVALID_ID");
  return id;
}

function translationMap(rows, idField) {
  const result = new Map();
  for (const row of rows) {
    const id = String(row[idField]);
    if (!result.has(id)) result.set(id, {});
    result.get(id)[row.language_code] = {
      name: row.name ?? "",
      description: row.description ?? "",
    };
  }
  return result;
}

async function fetchStorefront(languageCode) {
  const [siteRows] = await pool.execute(
    `SELECT s.id, s.phone, s.currency_code, s.timezone, s.logo_url, s.logo_key,
            s.cover_image_url, s.cover_image_key, s.delivery_image_url, s.delivery_image_key,
            s.pickup_image_url, s.pickup_image_key,
            s.product_placeholder_url, s.product_placeholder_key,
            COALESCE(st.name, vi.name) AS name,
            COALESCE(st.tagline, vi.tagline) AS tagline,
            COALESCE(st.opening_hours, vi.opening_hours) AS opening_hours,
            COALESCE(st.address, vi.address) AS address,
            COALESCE(st.seo_title, vi.seo_title) AS seo_title,
            COALESCE(st.seo_description, vi.seo_description) AS seo_description
       FROM sites s
       LEFT JOIN site_translations st
         ON st.site_id = s.id AND st.language_code = ?
       LEFT JOIN site_translations vi
         ON vi.site_id = s.id AND vi.language_code = 'vi'
      WHERE s.is_active = TRUE
      ORDER BY s.id
      LIMIT 1`,
    [languageCode],
  );
  if (siteRows.length === 0) return null;

  const site = siteRows[0];
  const [categoryRows] = await pool.execute(
    `SELECT c.id, c.slug, c.sort_order,
            COALESCE(ct.name, vi.name) AS name
       FROM categories c
       LEFT JOIN category_translations ct
         ON ct.category_id = c.id AND ct.language_code = ?
       LEFT JOIN category_translations vi
         ON vi.category_id = c.id AND vi.language_code = 'vi'
      WHERE c.site_id = ? AND c.is_active = TRUE
      ORDER BY c.sort_order, c.id`,
    [languageCode, site.id],
  );
  const [productRows] = await pool.execute(
    `SELECT p.id, p.category_id, p.slug, p.sku, p.price, p.image_url, p.image_key,
            s.product_placeholder_url, s.product_placeholder_key,
            p.is_sold_out, p.sort_order,
            COALESCE(pt.name, vi.name) AS name,
            COALESCE(pt.description, vi.description) AS description
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       INNER JOIN sites s ON s.id = c.site_id
       LEFT JOIN product_translations pt
         ON pt.product_id = p.id AND pt.language_code = ?
       LEFT JOIN product_translations vi
         ON vi.product_id = p.id AND vi.language_code = 'vi'
      WHERE c.site_id = ? AND c.is_active = TRUE AND p.is_active = TRUE
      ORDER BY p.sort_order, p.id`,
    [languageCode, site.id],
  );

  const productsByCategory = new Map();
  for (const product of productRows) {
    const categoryId = String(product.category_id);
    if (!productsByCategory.has(categoryId)) productsByCategory.set(categoryId, []);
    productsByCategory.get(categoryId).push({
      id: String(product.id),
      categoryId,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      image: product.image_key
        ? mediaUrl(product.image_key)
        : (product.image_url || (product.product_placeholder_key
          ? mediaUrl(product.product_placeholder_key)
          : product.product_placeholder_url)),
      soldOut: Boolean(product.is_sold_out),
    });
  }

  return {
    language: languageCode,
    site: {
      id: String(site.id),
      name: site.name,
      tagline: site.tagline,
      openingHours: site.opening_hours,
      address: site.address,
      phone: site.phone,
      currencyCode: site.currency_code,
      timezone: site.timezone,
      logoUrl: site.logo_key ? mediaUrl(site.logo_key) : site.logo_url,
      coverImageUrl: site.cover_image_key ? mediaUrl(site.cover_image_key) : site.cover_image_url,
      deliveryImageUrl: site.delivery_image_key ? mediaUrl(site.delivery_image_key) : site.delivery_image_url,
      pickupImageUrl: site.pickup_image_key ? mediaUrl(site.pickup_image_key) : site.pickup_image_url,
      productPlaceholderUrl: site.product_placeholder_key
        ? mediaUrl(site.product_placeholder_key)
        : site.product_placeholder_url,
      seoTitle: site.seo_title,
      seoDescription: site.seo_description,
    },
    categories: categoryRows.map((category) => ({
      id: String(category.id),
      slug: category.slug,
      name: category.name,
      products: productsByCategory.get(String(category.id)) ?? [],
    })),
  };
}

async function fetchCachedStorefront(languageCode) {
  const cached = storefrontCache.get(languageCode);
  if (cached?.data && cached.expiresAt > Date.now()) return cached.data;
  if (cached?.pending) return cached.pending;

  const version = storefrontCacheVersion;
  const pending = fetchStorefront(languageCode);
  storefrontCache.set(languageCode, { pending });
  try {
    const data = await pending;
    if (version === storefrontCacheVersion) {
      storefrontCache.set(languageCode, { data, expiresAt: Date.now() + storefrontCacheTtlMs });
    }
    return data;
  } catch (error) {
    storefrontCache.delete(languageCode);
    throw error;
  }
}

function invalidateStorefrontCache() {
  storefrontCacheVersion += 1;
  storefrontCache.clear();
}

async function fetchAdminData() {
  const [siteRows] = await pool.query("SELECT * FROM sites ORDER BY id LIMIT 1");
  const site = siteRows[0];
  const [siteTranslationRows] = await pool.execute(
    "SELECT * FROM site_translations WHERE site_id = ?",
    [site.id],
  );
  const [categoryRows] = await pool.execute(
    "SELECT * FROM categories WHERE site_id = ? ORDER BY sort_order, id",
    [site.id],
  );
  const [categoryTranslationRows] = await pool.query(
    `SELECT ct.* FROM category_translations ct
      INNER JOIN categories c ON c.id = ct.category_id
      WHERE c.site_id = ?`,
    [site.id],
  );
  const [productRows] = await pool.query(
    `SELECT p.* FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE c.site_id = ?
      ORDER BY c.sort_order, p.sort_order, p.id`,
    [site.id],
  );
  const [productTranslationRows] = await pool.query(
    `SELECT pt.* FROM product_translations pt
      INNER JOIN products p ON p.id = pt.product_id
      INNER JOIN categories c ON c.id = p.category_id
      WHERE c.site_id = ?`,
    [site.id],
  );

  const siteTranslations = {};
  for (const row of siteTranslationRows) {
    siteTranslations[row.language_code] = {
      name: row.name ?? "",
      tagline: row.tagline ?? "",
      openingHours: row.opening_hours ?? "",
      address: row.address ?? "",
      seoTitle: row.seo_title ?? "",
      seoDescription: row.seo_description ?? "",
    };
  }
  const categoryTranslations = translationMap(categoryTranslationRows, "category_id");
  const productTranslations = translationMap(productTranslationRows, "product_id");

  return {
    languages: languageCodes,
    site: {
      id: String(site.id),
      phone: site.phone,
      currencyCode: site.currency_code,
      timezone: site.timezone,
      logoUrl: site.logo_key ? mediaUrl(site.logo_key) : site.logo_url,
      coverImageUrl: site.cover_image_key ? mediaUrl(site.cover_image_key) : site.cover_image_url,
      deliveryImageUrl: site.delivery_image_key ? mediaUrl(site.delivery_image_key) : site.delivery_image_url,
      pickupImageUrl: site.pickup_image_key ? mediaUrl(site.pickup_image_key) : site.pickup_image_url,
      productPlaceholderUrl: site.product_placeholder_key
        ? mediaUrl(site.product_placeholder_key)
        : site.product_placeholder_url,
      translations: siteTranslations,
    },
    categories: categoryRows.map((category) => ({
      id: String(category.id),
      slug: category.slug,
      sortOrder: category.sort_order,
      active: Boolean(category.is_active),
      translations: categoryTranslations.get(String(category.id)) ?? {},
    })),
    products: productRows.map((product) => ({
      id: String(product.id),
      categoryId: String(product.category_id),
      slug: product.slug,
      sku: product.sku ?? "",
      price: Number(product.price),
      imageUrl: product.image_key ? mediaUrl(product.image_key) : product.image_url,
      soldOut: Boolean(product.is_sold_out),
      active: Boolean(product.is_active),
      sortOrder: product.sort_order,
      translations: productTranslations.get(String(product.id)) ?? {},
    })),
  };
}

async function fetchAdminOrders(query) {
  const requestedPage = Number(query.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 20;
  const fulfillmentMode = fulfillmentModes.includes(query.fulfillmentMode)
    ? query.fulfillmentMode
    : null;
  const status = orderStatuses.includes(query.status) ? query.status : null;
  const search = cleanText(query.search, 100);

  const [siteRows] = await pool.query("SELECT id FROM sites ORDER BY id LIMIT 1");
  const siteId = siteRows[0]?.id;
  if (!siteId) return { orders: [], total: 0, page: 1, pageSize, totalPages: 0 };

  const conditions = ["o.site_id = ?"];
  const values = [siteId];
  if (fulfillmentMode) {
    conditions.push("o.fulfillment_mode = ?");
    values.push(fulfillmentMode);
  }
  if (status) {
    conditions.push("o.status = ?");
    values.push(status);
  }
  if (search) {
    conditions.push("(o.order_code LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)");
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern);
  }
  const where = conditions.join(" AND ");
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM orders o WHERE ${where}`,
    values,
  );
  const total = Number(countRows[0].total);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  const [orderRows] = await pool.execute(
    `SELECT o.* FROM orders o
      WHERE ${where}
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT ${pageSize} OFFSET ${offset}`,
    values,
  );

  const itemsByOrder = new Map();
  const emailLogsByOrder = new Map();
  if (orderRows.length > 0) {
    const orderIds = orderRows.map((order) => order.id);
    const [itemRows] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id`,
      [orderIds],
    );
    for (const item of itemRows) {
      const orderId = String(item.order_id);
      if (!itemsByOrder.has(orderId)) itemsByOrder.set(orderId, []);
      itemsByOrder.get(orderId).push({
        id: String(item.id),
        productId: item.product_id == null ? null : String(item.product_id),
        productName: item.product_name,
        productImageUrl: item.product_image_url,
        unitPrice: Number(item.unit_price),
        quantity: item.quantity,
        lineTotal: Number(item.line_total),
      });
    }
    const [emailLogRows] = await pool.query(
      `SELECT * FROM order_email_logs WHERE order_id IN (?) ORDER BY created_at DESC, id DESC`,
      [orderIds],
    );
    const eventsByEmailLog = new Map();
    if (emailLogRows.length > 0) {
      const emailLogIds = emailLogRows.map((emailLog) => emailLog.id);
      const [eventRows] = await pool.query(
        `SELECT * FROM order_email_events WHERE email_log_id IN (?) ORDER BY occurred_at DESC, id DESC`,
        [emailLogIds],
      );
      for (const event of eventRows) {
        const emailLogId = String(event.email_log_id);
        if (!eventsByEmailLog.has(emailLogId)) eventsByEmailLog.set(emailLogId, []);
        eventsByEmailLog.get(emailLogId).push({
          id: String(event.id),
          eventType: event.event_type,
          payload: event.payload,
          occurredAt: event.occurred_at,
          createdAt: event.created_at,
        });
      }
    }
    for (const emailLog of emailLogRows) {
      const orderId = String(emailLog.order_id);
      if (!emailLogsByOrder.has(orderId)) emailLogsByOrder.set(orderId, []);
      emailLogsByOrder.get(orderId).push({
        id: String(emailLog.id),
        recipient: emailLog.recipient,
        sender: emailLog.sender,
        subject: emailLog.subject,
        textBody: emailLog.text_body,
        htmlBody: emailLog.html_body,
        status: emailLog.status,
        providerMessageId: emailLog.provider_message_id,
        providerResponse: emailLog.provider_response,
        errorMessage: emailLog.error_message,
        attemptedAt: emailLog.attempted_at,
        sentAt: emailLog.sent_at,
        createdAt: emailLog.created_at,
        events: eventsByEmailLog.get(String(emailLog.id)) ?? [],
      });
    }
  }

  return {
    orders: orderRows.map((order) => ({
      id: String(order.id),
      orderCode: order.order_code,
      languageCode: order.language_code,
      fulfillmentMode: order.fulfillment_mode,
      status: order.status,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      deliveryAddress: order.delivery_address,
      customerNote: order.customer_note,
      currencyCode: order.currency_code,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: itemsByOrder.get(String(order.id)) ?? [],
      emailLogs: emailLogsByOrder.get(String(order.id)) ?? [],
    })),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

app.get("/api/health", asyncRoute(async (_request, response) => {
  await pool.query("SELECT 1");
  response.json({ ok: true, service: "minimart-api" });
}));

app.get("/api/storefront", asyncRoute(async (request, response) => {
  const data = await fetchCachedStorefront(validateLanguage(request.query.lang));
  if (!data) return response.status(503).json({ error: "STORE_NOT_CONFIGURED" });
  response.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
  return response.json(data);
}));

async function sendMedia(request, response) {
  const key = decodeURIComponent(request.params[0] ?? "");
  if (!key || key.includes("..") || !/^(products|site)\/[a-z0-9-]+\/[a-f0-9-]+\.webp$/.test(key)) {
    return response.status(400).json({ error: "INVALID_MEDIA_KEY" });
  }

  const range = typeof request.headers.range === "string" && /^bytes=\d+-\d*$/.test(request.headers.range)
    ? request.headers.range
    : undefined;
  const object = await getImage(key, range);
  response.set("Content-Type", object.ContentType ?? "image/webp");
  response.set("Cache-Control", object.CacheControl ?? "public, max-age=31536000, immutable");
  if (object.ETag) response.set("ETag", object.ETag);
  if (object.ContentLength != null) response.set("Content-Length", String(object.ContentLength));
  if (object.ContentRange) response.set("Content-Range", object.ContentRange);
  if (range) response.status(206);
  if (request.method === "HEAD") return response.end();
  await pipeline(object.Body, response);
}

app.get(/^\/api\/media\/(.+)$/, asyncRoute(sendMedia));
app.head(/^\/api\/media\/(.+)$/, asyncRoute(sendMedia));

app.post("/api/orders", asyncRoute(async (request, response) => {
  const languageCode = validateLanguage(request.body?.language);
  const fulfillmentMode = request.body?.fulfillmentMode;
  if (!['delivery', 'pickup'].includes(fulfillmentMode)) throw new Error("INVALID_FULFILLMENT");
  const customerName = cleanText(request.body?.customerName, 255, true);
  const customerPhone = cleanText(request.body?.customerPhone, 30, true);
  const deliveryAddress = cleanText(request.body?.deliveryAddress, 1000);
  const customerNote = cleanText(request.body?.note, 500);
  if (fulfillmentMode === "delivery" && !deliveryAddress) throw new Error("DELIVERY_ADDRESS_REQUIRED");

  const requestedItems = new Map();
  for (const item of Array.isArray(request.body?.items) ? request.body.items : []) {
    const productId = toPositiveId(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("INVALID_QUANTITY");
    requestedItems.set(productId, (requestedItems.get(productId) ?? 0) + quantity);
  }
  if (requestedItems.size === 0) throw new Error("EMPTY_ORDER");

  const connection = await pool.getConnection();
  let committed = false;
  try {
    await connection.beginTransaction();
    const productIds = [...requestedItems.keys()];
    const [rows] = await connection.query(
      `SELECT p.id, p.price, p.image_url, p.image_key, p.is_active, p.is_sold_out,
              COALESCE(pt.name, vi.name) AS name, c.site_id, s.currency_code
         FROM products p
         INNER JOIN categories c ON c.id = p.category_id
         INNER JOIN sites s ON s.id = c.site_id
         LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.language_code = ?
         LEFT JOIN product_translations vi ON vi.product_id = p.id AND vi.language_code = 'vi'
        WHERE p.id IN (?) FOR UPDATE`,
      [languageCode, productIds],
    );
    if (rows.length !== productIds.length || rows.some((row) => !row.is_active || row.is_sold_out)) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }

    const subtotal = rows.reduce(
      (sum, product) => sum + Number(product.price) * requestedItems.get(Number(product.id)),
      0,
    );
    const orderCode = `MM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const [orderResult] = await connection.execute(
      `INSERT INTO orders
        (order_code, site_id, language_code, fulfillment_mode, customer_name,
         customer_phone, delivery_address, customer_note, currency_code, subtotal, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderCode, rows[0].site_id, languageCode, fulfillmentMode, customerName,
        customerPhone, deliveryAddress, customerNote, rows[0].currency_code, subtotal, subtotal],
    );

    for (const product of rows) {
      const quantity = requestedItems.get(Number(product.id));
      const unitPrice = Number(product.price);
      await connection.execute(
        `INSERT INTO order_items
          (order_id, product_id, product_name, product_image_url, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderResult.insertId, product.id, product.name,
          product.image_key ? mediaUrl(product.image_key) : product.image_url,
          unitPrice, quantity, unitPrice * quantity],
      );
    }

    const email = buildOrderEmail({
      orderCode,
      fulfillmentMode,
      customerName,
      customerPhone,
      deliveryAddress,
      customerNote,
      currencyCode: rows[0].currency_code,
      total: subtotal,
      items: rows.map((product) => {
        const quantity = requestedItems.get(Number(product.id));
        return {
          name: product.name,
          quantity,
          lineTotal: Number(product.price) * quantity,
        };
      }),
    });
    const emailLogId = await createOrderEmailLog(connection, orderResult.insertId, email);

    await connection.commit();
    committed = true;
    const notification = await deliverOrderEmail(emailLogId).catch((error) => {
      console.error(JSON.stringify({ event: "order_email", logId: emailLogId, status: "failed", error: error instanceof Error ? error.message : "EMAIL_SEND_FAILED" }));
      return { status: "failed" };
    });
    return response.status(201).json({ orderCode, total: subtotal, notificationStatus: notification.status });
  } catch (error) {
    if (!committed) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.get("/api/orders/:orderCode", asyncRoute(async (request, response) => {
  const orderCode = cleanText(request.params.orderCode, 32, true);
  const customerPhone = cleanText(request.query.phone, 30, true);
  if (!/^MM[A-Z0-9]+$/.test(orderCode)) throw new Error("INVALID_ORDER_CODE");

  const [orderRows] = await pool.execute(
    `SELECT id, order_code, fulfillment_mode, status, currency_code, total, created_at, updated_at
       FROM orders
      WHERE order_code = ? AND customer_phone = ?
      LIMIT 1`,
    [orderCode, customerPhone],
  );
  if (orderRows.length === 0) return response.status(404).json({ error: "ORDER_NOT_FOUND" });

  const order = orderRows[0];
  const [itemRows] = await pool.execute(
    `SELECT id, product_name, unit_price, quantity, line_total
       FROM order_items
      WHERE order_id = ?
      ORDER BY id`,
    [order.id],
  );
  response.set("Cache-Control", "no-store");
  return response.json({
    orderCode: order.order_code,
    fulfillmentMode: order.fulfillment_mode,
    status: order.status,
    currencyCode: order.currency_code,
    total: Number(order.total),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: itemRows.map((item) => ({
      id: String(item.id),
      productName: item.product_name,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
    })),
  });
}));

app.post("/api/admin/login", asyncRoute(async (request, response) => {
  const key = request.ip;
  const now = Date.now();
  const state = loginAttempts.get(key) ?? { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > state.resetAt) {
    state.count = 0;
    state.resetAt = now + 15 * 60 * 1000;
  }
  if (state.count >= 10) return response.status(429).json({ error: "TOO_MANY_ATTEMPTS" });

  const username = cleanText(request.body?.username, 100, true);
  const password = cleanText(request.body?.password, 255, true);
  const [rows] = await pool.execute(
    "SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1",
    [username],
  );
  const valid = rows.length === 1 && await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) {
    state.count += 1;
    loginAttempts.set(key, state);
    return response.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  loginAttempts.delete(key);
  await pool.execute("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", [rows[0].id]);
  const token = createSession(rows[0]);
  setSessionCookie(response, token);
  return response.json({ user: { id: String(rows[0].id), username: rows[0].username } });
}));

app.get("/api/admin/session", requireAdmin, (request, response) => {
  response.json({ user: { id: request.admin.sub, username: request.admin.username } });
});

app.delete("/api/admin/session", requireAdmin, (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});

app.get("/api/admin/data", requireAdmin, asyncRoute(async (_request, response) => {
  response.set("Cache-Control", "no-store");
  response.json(await fetchAdminData());
}));

app.get("/api/admin/orders", requireAdmin, asyncRoute(async (request, response) => {
  response.set("Cache-Control", "no-store");
  response.json(await fetchAdminOrders(request.query));
}));

app.patch("/api/admin/orders/:id/status", requireAdmin, asyncRoute(async (request, response) => {
  const orderId = toPositiveId(request.params.id);
  const status = request.body?.status;
  if (!orderStatuses.includes(status)) throw new Error("INVALID_ORDER_STATUS");
  const [orderRows] = await pool.execute(
    "SELECT id FROM orders WHERE id = ? LIMIT 1",
    [orderId],
  );
  if (orderRows.length === 0) return response.status(404).json({ error: "ORDER_NOT_FOUND" });
  await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  return response.json({ id: String(orderId), status });
}));

app.put(
  "/api/admin/site",
  requireAdmin,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "deliveryImage", maxCount: 1 },
    { name: "pickupImage", maxCount: 1 },
    { name: "productPlaceholder", maxCount: 1 },
  ]),
  asyncRoute(async (request, response) => {
    const data = parseJsonField(request);
    const phone = cleanText(data.phone, 30, true);
    const currencyCode = validateCurrencyCode(data.currencyCode);
    const timezone = validateTimezone(data.timezone);
    const [siteRows] = await pool.query("SELECT * FROM sites ORDER BY id LIMIT 1");
    const site = siteRows[0];
    const files = request.files ?? {};
    const uploaded = [];

    try {
      const logo = files.logo?.[0]
        ? await uploadImage(files.logo[0].buffer, "site", "logo")
        : null;
      if (logo) uploaded.push(logo.key);
      const cover = files.cover?.[0]
        ? await uploadImage(files.cover[0].buffer, "site", "cover")
        : null;
      if (cover) uploaded.push(cover.key);
      const deliveryImage = files.deliveryImage?.[0]
        ? await uploadImage(files.deliveryImage[0].buffer, "site", "delivery")
        : null;
      if (deliveryImage) uploaded.push(deliveryImage.key);
      const pickupImage = files.pickupImage?.[0]
        ? await uploadImage(files.pickupImage[0].buffer, "site", "pickup")
        : null;
      if (pickupImage) uploaded.push(pickupImage.key);
      const productPlaceholder = files.productPlaceholder?.[0]
        ? await uploadImage(files.productPlaceholder[0].buffer, "site", "product-placeholder")
        : null;
      if (productPlaceholder) uploaded.push(productPlaceholder.key);

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(
          `UPDATE sites SET phone = ?, currency_code = ?, timezone = ?,
             logo_url = COALESCE(?, logo_url), logo_key = COALESCE(?, logo_key),
             cover_image_url = COALESCE(?, cover_image_url), cover_image_key = COALESCE(?, cover_image_key),
             delivery_image_url = COALESCE(?, delivery_image_url), delivery_image_key = COALESCE(?, delivery_image_key),
             pickup_image_url = COALESCE(?, pickup_image_url), pickup_image_key = COALESCE(?, pickup_image_key),
             product_placeholder_url = COALESCE(?, product_placeholder_url),
             product_placeholder_key = COALESCE(?, product_placeholder_key)
           WHERE id = ?`,
          [phone, currencyCode, timezone,
            logo?.url ?? null, logo?.key ?? null, cover?.url ?? null, cover?.key ?? null,
            deliveryImage?.url ?? null, deliveryImage?.key ?? null,
            pickupImage?.url ?? null, pickupImage?.key ?? null,
            productPlaceholder?.url ?? null, productPlaceholder?.key ?? null, site.id],
        );

        for (const languageCode of languageCodes) {
          const translation = data.translations?.[languageCode] ?? {};
          const name = cleanText(translation.name, 255, languageCode === "vi");
          if (!name) {
            await connection.execute(
              "DELETE FROM site_translations WHERE site_id = ? AND language_code = ?",
              [site.id, languageCode],
            );
            continue;
          }
          await connection.execute(
            `INSERT INTO site_translations
              (site_id, language_code, name, tagline, opening_hours, address, seo_title, seo_description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name), tagline = VALUES(tagline),
               opening_hours = VALUES(opening_hours), address = VALUES(address),
               seo_title = VALUES(seo_title), seo_description = VALUES(seo_description)`,
            [site.id, languageCode, name, cleanText(translation.tagline, 500),
              cleanText(translation.openingHours, 255), cleanText(translation.address, 1000),
              cleanText(translation.seoTitle, 255), cleanText(translation.seoDescription, 500)],
          );
        }
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      if (logo && site.logo_key) deleteImage(site.logo_key).catch(console.error);
      if (cover && site.cover_image_key) deleteImage(site.cover_image_key).catch(console.error);
      if (deliveryImage && site.delivery_image_key) deleteImage(site.delivery_image_key).catch(console.error);
      if (pickupImage && site.pickup_image_key) deleteImage(site.pickup_image_key).catch(console.error);
      if (productPlaceholder && site.product_placeholder_key) deleteImage(site.product_placeholder_key).catch(console.error);
      invalidateStorefrontCache();
      return response.json(await fetchAdminData());
    } catch (error) {
      await Promise.all(uploaded.map((key) => deleteImage(key).catch(() => undefined)));
      throw error;
    }
  }),
);

async function saveCategory(request, response, categoryId = null) {
  const slug = validateSlug(request.body?.slug);
  const sortOrder = Number(request.body?.sortOrder) || 0;
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0 || sortOrder > 65535) {
    throw new Error("INVALID_SORT_ORDER");
  }
  cleanText(request.body?.translations?.vi?.name, 255, true);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (categoryId) {
      const [existingRows] = await connection.execute(
        "SELECT id FROM categories WHERE id = ? LIMIT 1",
        [categoryId],
      );
      if (existingRows.length === 0) {
        await connection.rollback();
        return response.status(404).json({ error: "CATEGORY_NOT_FOUND" });
      }
      await connection.execute(
        "UPDATE categories SET slug = ?, sort_order = ?, is_active = ? WHERE id = ?",
        [slug, sortOrder, request.body?.active !== false, categoryId],
      );
    } else {
      const [siteRows] = await connection.query("SELECT id FROM sites ORDER BY id LIMIT 1");
      if (siteRows.length === 0) throw new Error("SITE_NOT_FOUND");
      const [result] = await connection.execute(
        "INSERT INTO categories (site_id, slug, sort_order, is_active) VALUES (?, ?, ?, ?)",
        [siteRows[0].id, slug, sortOrder, request.body?.active !== false],
      );
      categoryId = result.insertId;
    }
    for (const languageCode of languageCodes) {
      const name = cleanText(request.body?.translations?.[languageCode]?.name, 255, languageCode === "vi");
      if (!name) {
        await connection.execute(
          "DELETE FROM category_translations WHERE category_id = ? AND language_code = ?",
          [categoryId, languageCode],
        );
        continue;
      }
      await connection.execute(
        `INSERT INTO category_translations (category_id, language_code, name)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [categoryId, languageCode, name],
      );
    }
    await connection.commit();
    invalidateStorefrontCache();
    return response.status(request.params.id ? 200 : 201).json(await fetchAdminData());
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

app.post(
  "/api/admin/categories",
  requireAdmin,
  asyncRoute((request, response) => saveCategory(request, response)),
);

app.put(
  "/api/admin/categories/:id",
  requireAdmin,
  asyncRoute((request, response) => saveCategory(request, response, toPositiveId(request.params.id))),
);

app.delete("/api/admin/categories/:id", requireAdmin, asyncRoute(async (request, response) => {
  const categoryId = toPositiveId(request.params.id);
  const [categoryRows] = await pool.execute(
    "SELECT id FROM categories WHERE id = ? LIMIT 1",
    [categoryId],
  );
  if (categoryRows.length === 0) return response.status(404).json({ error: "CATEGORY_NOT_FOUND" });
  const [productRows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM products WHERE category_id = ?",
    [categoryId],
  );
  if (Number(productRows[0].total) > 0) {
    return response.status(409).json({ error: "CATEGORY_NOT_EMPTY" });
  }
  await pool.execute("DELETE FROM categories WHERE id = ?", [categoryId]);
  invalidateStorefrontCache();
  return response.status(204).end();
}));

async function saveProduct(request, response, productId = null) {
  const data = parseJsonField(request);
  const categoryId = toPositiveId(data.categoryId);
  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0 || price > 9999999999999) throw new Error("INVALID_PRICE");
  const translations = data.translations ?? {};
  const vietnameseName = cleanText(translations.vi?.name, 255, true);

  let previous = null;
  if (productId) {
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ? LIMIT 1", [productId]);
    if (rows.length === 0) return response.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    previous = rows[0];
  }
  const slug = previous?.slug ?? await createUniqueProductSlug(vietnameseName);

  let uploaded = null;
  try {
    if (request.file) uploaded = await uploadImage(request.file.buffer, "products", slug);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [categoryRows] = await connection.execute(
        "SELECT id FROM categories WHERE id = ? LIMIT 1",
        [categoryId],
      );
      if (categoryRows.length === 0) throw new Error("CATEGORY_NOT_FOUND");

      if (productId) {
        await connection.execute(
          `UPDATE products SET category_id = ?, sku = ?, price = ?,
             image_url = COALESCE(?, image_url), image_key = COALESCE(?, image_key),
             is_sold_out = ?, is_active = ?, sort_order = ?
           WHERE id = ?`,
          [categoryId, cleanText(data.sku, 100), price,
            uploaded?.url ?? null, uploaded?.key ?? null, Boolean(data.soldOut),
            data.active !== false, Number(data.sortOrder) || 0, productId],
        );
      } else {
        const [result] = await connection.execute(
          `INSERT INTO products
            (category_id, slug, sku, price, image_url, image_key, is_sold_out, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [categoryId, slug, cleanText(data.sku, 100), price,
            uploaded?.url ?? null, uploaded?.key ?? null,
            Boolean(data.soldOut), data.active !== false, Number(data.sortOrder) || 0],
        );
        productId = result.insertId;
      }

      for (const languageCode of languageCodes) {
        const translation = translations[languageCode] ?? {};
        const name = cleanText(translation.name, 255, languageCode === "vi");
        if (!name) {
          await connection.execute(
            "DELETE FROM product_translations WHERE product_id = ? AND language_code = ?",
            [productId, languageCode],
          );
          continue;
        }
        await connection.execute(
          `INSERT INTO product_translations (product_id, language_code, name, description)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
          [productId, languageCode, name, cleanText(translation.description, 10000)],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    if (uploaded && previous?.image_key) deleteImage(previous.image_key).catch(console.error);
    invalidateStorefrontCache();
    return response.status(previous ? 200 : 201).json(await fetchAdminData());
  } catch (error) {
    if (uploaded) await deleteImage(uploaded.key).catch(() => undefined);
    throw error;
  }
}

app.post(
  "/api/admin/products",
  requireAdmin,
  upload.single("image"),
  asyncRoute((request, response) => saveProduct(request, response)),
);

app.put(
  "/api/admin/products/:id",
  requireAdmin,
  upload.single("image"),
  asyncRoute((request, response) => saveProduct(request, response, toPositiveId(request.params.id))),
);

app.delete("/api/admin/products/:id", requireAdmin, asyncRoute(async (request, response) => {
  const productId = toPositiveId(request.params.id);
  const [rows] = await pool.execute("SELECT image_key FROM products WHERE id = ? LIMIT 1", [productId]);
  if (rows.length === 0) return response.status(404).json({ error: "PRODUCT_NOT_FOUND" });
  await pool.execute("DELETE FROM products WHERE id = ?", [productId]);
  if (rows[0].image_key) await deleteImage(rows[0].image_key).catch(console.error);
  invalidateStorefrontCache();
  return response.status(204).end();
}));

app.use("/api", (_request, response) => response.status(404).json({ error: "API_NOT_FOUND" }));

app.use(express.static(outDirectory, {
  extensions: ["html"],
  setHeaders(response, filePath) {
    if (filePath.endsWith(".html")) response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    else if (filePath.includes(`${path.sep}_next${path.sep}static${path.sep}`)) {
      response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));
app.get(/^\/_next\/static\/chunks\/.+\.js$/, (_request, response) => {
  response
    .status(200)
    .type("application/javascript")
    .set("Cache-Control", "no-store")
    .send("window.location.reload();");
});
const sendHtml = (fileName) => (_request, response) => response
  .set("Cache-Control", "no-store, no-cache, must-revalidate")
  .sendFile(path.join(outDirectory, fileName));
app.get("/", sendHtml("index.html"));
app.get("/admin", sendHtml("admin.html"));

app.use((error, _request, response, _next) => {
  void _next;
  if (error instanceof multer.MulterError) {
    return response.status(400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "IMAGE_TOO_LARGE" : "UPLOAD_ERROR" });
  }
  const clientErrors = new Set([
    "REQUIRED_FIELD", "FIELD_TOO_LONG", "INVALID_FORM_DATA", "INVALID_SLUG",
    "INVALID_ID", "INVALID_PRICE", "INVALID_SORT_ORDER", "INVALID_IMAGE_TYPE", "INVALID_FULFILLMENT",
    "INVALID_ORDER_STATUS", "INVALID_ORDER_CODE", "INVALID_CURRENCY_CODE", "INVALID_TIMEZONE",
    "INVALID_QUANTITY", "EMPTY_ORDER", "DELIVERY_ADDRESS_REQUIRED", "CATEGORY_NOT_FOUND",
    "PRODUCT_UNAVAILABLE",
  ]);
  if (clientErrors.has(error.message)) return response.status(400).json({ error: error.message });
  if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ error: "DUPLICATE_VALUE" });
  if (error.code === "NoSuchKey" || error.Code === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
    return response.status(404).json({ error: "MEDIA_NOT_FOUND" });
  }
  console.error(error);
  return response.status(500).json({ error: "INTERNAL_ERROR" });
});

await initializeDatabase();
app.listen(config.port, "0.0.0.0", () => {
  console.log(`MiniMart server listening on port ${config.port}`);
});
