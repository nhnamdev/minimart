import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

import { config } from "./config.mjs";
import { catalogTranslations, initialCategories, initialSite } from "./seed-data.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  charset: "utf8mb4",
  connectionLimit: 10,
  enableKeepAlive: true,
  decimalNumbers: true,
});

async function applySchema() {
  const schemaPath = path.resolve(currentDirectory, "../database/schema.sql");
  const schema = await readFile(schemaPath, "utf8");
  const statements = schema
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);

  const connection = await pool.getConnection();
  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
  } finally {
    connection.release();
  }
}

async function ensureSiteMediaColumns() {
  const definitions = {
    delivery_image_url: "VARCHAR(1000) NULL",
    delivery_image_key: "VARCHAR(1000) CHARACTER SET ascii COLLATE ascii_bin NULL",
    pickup_image_url: "VARCHAR(1000) NULL",
    pickup_image_key: "VARCHAR(1000) CHARACTER SET ascii COLLATE ascii_bin NULL",
    product_placeholder_url: "VARCHAR(1000) NULL",
    product_placeholder_key: "VARCHAR(1000) CHARACTER SET ascii COLLATE ascii_bin NULL",
  };
  const [rows] = await pool.query("SHOW COLUMNS FROM sites");
  const existing = new Set(rows.map((row) => row.Field));
  for (const [column, definition] of Object.entries(definitions)) {
    if (!existing.has(column)) await pool.query(`ALTER TABLE sites ADD COLUMN ${column} ${definition}`);
  }
  await pool.execute(
    `UPDATE sites SET
       delivery_image_url = COALESCE(delivery_image_url, ?),
       pickup_image_url = COALESCE(pickup_image_url, ?),
       product_placeholder_url = COALESCE(product_placeholder_url, ?)`,
    [initialSite.deliveryImageUrl, initialSite.pickupImageUrl, initialSite.productPlaceholderUrl],
  );
}

async function ensureOrderDiscountCodeColumn() {
  const [rows] = await pool.query("SHOW COLUMNS FROM orders");
  const existing = new Set(rows.map((row) => row.Field));
  if (!existing.has("discount_code")) {
    await pool.query("ALTER TABLE orders ADD COLUMN discount_code VARCHAR(100) NULL");
  }
}

async function ensureReferralTablesAndColumns() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS referral_codes (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      code VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
      agent_name VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NULL,
      discount_percent DECIMAL(5, 2) UNSIGNED NOT NULL DEFAULT 5.00,
      commission_percent DECIMAL(5, 2) UNSIGNED NOT NULL DEFAULT 5.00,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      note TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_referral_codes_code (code),
      KEY idx_referral_codes_active (is_active)
    ) ENGINE = InnoDB
  `);

  const [orderColumns] = await pool.query("SHOW COLUMNS FROM orders");
  const existingCols = new Set(orderColumns.map((row) => row.Field));
  if (!existingCols.has("referral_code")) {
    await pool.query("ALTER TABLE orders ADD COLUMN referral_code VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NULL, ADD KEY idx_orders_referral_code (referral_code)");
  }
  if (!existingCols.has("referral_discount_amount")) {
    await pool.query("ALTER TABLE orders ADD COLUMN referral_discount_amount DECIMAL(15, 2) UNSIGNED NOT NULL DEFAULT 0.00");
  }
  if (!existingCols.has("referral_commission")) {
    await pool.query("ALTER TABLE orders ADD COLUMN referral_commission DECIMAL(15, 2) UNSIGNED NOT NULL DEFAULT 0.00");
  }
}

async function ensureAdmin() {
  const [rows] = await pool.execute(
    "SELECT id FROM admin_users WHERE username = ? LIMIT 1",
    [config.admin.username],
  );
  if (rows.length > 0) return;

  const passwordHash = await bcrypt.hash(config.admin.password, 12);
  await pool.execute(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
    [config.admin.username, passwordHash],
  );
}

async function seedCatalog() {
  const [siteRows] = await pool.query("SELECT id FROM sites ORDER BY id LIMIT 1");
  if (siteRows.length > 0) return;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [siteResult] = await connection.execute(
      `INSERT INTO sites
        (phone, currency_code, timezone, logo_url, cover_image_url,
         delivery_image_url, pickup_image_url, product_placeholder_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        initialSite.phone,
        initialSite.currencyCode,
        initialSite.timezone,
        initialSite.logoUrl,
        initialSite.coverImageUrl,
        initialSite.deliveryImageUrl,
        initialSite.pickupImageUrl,
        initialSite.productPlaceholderUrl,
      ],
    );
    const siteId = siteResult.insertId;

    for (const [languageCode, translation] of Object.entries(initialSite.translations)) {
      await connection.execute(
        `INSERT INTO site_translations
          (site_id, language_code, name, tagline, opening_hours, address, seo_title, seo_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          siteId,
          languageCode,
          translation.name,
          translation.tagline,
          translation.openingHours,
          translation.address,
          translation.seoTitle,
          translation.seoDescription,
        ],
      );
    }

    for (const [categoryIndex, category] of initialCategories.entries()) {
      const [categoryResult] = await connection.execute(
        "INSERT INTO categories (site_id, slug, sort_order) VALUES (?, ?, ?)",
        [siteId, category.slug, categoryIndex + 1],
      );
      const categoryId = categoryResult.insertId;
      await connection.execute(
        "INSERT INTO category_translations (category_id, language_code, name) VALUES (?, 'vi', ?)",
        [categoryId, category.name],
      );
      for (const [languageCode, name] of Object.entries(catalogTranslations.categories[category.slug])) {
        await connection.execute(
          "INSERT INTO category_translations (category_id, language_code, name) VALUES (?, ?, ?)",
          [categoryId, languageCode, name],
        );
      }

      for (const [productIndex, product] of category.products.entries()) {
        const [slug, name, description, price, imageUrl] = product;
        const [productResult] = await connection.execute(
          `INSERT INTO products
            (category_id, slug, price, image_url, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [categoryId, slug, price, imageUrl, productIndex + 1],
        );
        await connection.execute(
          `INSERT INTO product_translations
            (product_id, language_code, name, description)
           VALUES (?, 'vi', ?, ?)`,
          [productResult.insertId, name, description],
        );
        for (const [languageCode, translation] of Object.entries(catalogTranslations.products[slug])) {
          await connection.execute(
            `INSERT INTO product_translations
              (product_id, language_code, name, description)
             VALUES (?, ?, ?, ?)`,
            [productResult.insertId, languageCode, translation.name, translation.description],
          );
        }
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function initializeDatabase() {
  await applySchema();
  await ensureSiteMediaColumns();
  await ensureOrderDiscountCodeColumn();
  await ensureReferralTablesAndColumns();
  await ensureAdmin();
  await seedCatalog();
}
