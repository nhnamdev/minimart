import { config } from "./config.mjs";
import { pool } from "./db.mjs";
import { Webhook } from "svix";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value, currencyCode) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(value);
}

export function buildOrderEmail(order) {
  const fulfillmentLabel = order.fulfillmentMode === "delivery" ? "Giao hàng" : "Khách đến lấy";
  const itemLines = order.items.map((item) =>
    `- ${item.name} × ${item.quantity}: ${formatMoney(item.lineTotal, order.currencyCode)}`,
  );
  const detailLines = [
    `Mã đơn: ${order.orderCode}`,
    `Hình thức: ${fulfillmentLabel}`,
    `Khách hàng: ${order.customerName}`,
    `Điện thoại: ${order.customerPhone}`,
    order.deliveryAddress ? `Địa chỉ giao hàng: ${order.deliveryAddress}` : null,
    order.customerNote ? `Ghi chú: ${order.customerNote}` : null,
    order.referralCode ? `Mã giới thiệu: ${order.referralCode}${order.referralDiscountAmount > 0 ? ` (Giảm ${formatMoney(order.referralDiscountAmount, order.currencyCode)})` : ""}` : null,
    "",
    "Sản phẩm:",
    ...itemLines,
    "",
    order.referralDiscountAmount > 0 ? `Tạm tính: ${formatMoney(order.subtotal, order.currencyCode)}\nGiảm giá giới thiệu: -${formatMoney(order.referralDiscountAmount, order.currencyCode)}\n` : null,
    `Tổng cộng: ${formatMoney(order.total, order.currencyCode)}`,
  ].filter((line) => line !== null);
  const text = detailLines.join("\n");
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.name)} × ${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap">${escapeHtml(formatMoney(item.lineTotal, order.currencyCode))}</td>
    </tr>`).join("");
  const html = `<!doctype html>
<html lang="vi"><body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#20252b">
  <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#141d27;color:#fff;padding:20px 24px"><h1 style="margin:0;font-size:22px">Tiệm Tiện Lợi Mỹ Trân — Đơn hàng mới</h1></div>
    <div style="padding:24px;line-height:1.6">
      <p><strong>Mã đơn:</strong> ${escapeHtml(order.orderCode)}</p>
      <p><strong>Hình thức:</strong> ${escapeHtml(fulfillmentLabel)}</p>
      <p><strong>Khách hàng:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>Điện thoại:</strong> ${escapeHtml(order.customerPhone)}</p>
      ${order.deliveryAddress ? `<p><strong>Địa chỉ giao hàng:</strong> ${escapeHtml(order.deliveryAddress)}</p>` : ""}
      ${order.customerNote ? `<p><strong>Ghi chú:</strong> ${escapeHtml(order.customerNote)}</p>` : ""}
      ${order.referralCode ? `<p><strong>Mã giới thiệu:</strong> ${escapeHtml(order.referralCode)}${order.referralDiscountAmount > 0 ? ` (Giảm ${escapeHtml(formatMoney(order.referralDiscountAmount, order.currencyCode))})` : ""}</p>` : ""}
      <table style="width:100%;border-collapse:collapse;margin-top:20px"><tbody>${itemRows}</tbody></table>
      ${order.referralDiscountAmount > 0 ? `<p style="margin-top:16px;text-align:right;color:#6b7280">Tạm tính: ${escapeHtml(formatMoney(order.subtotal, order.currencyCode))}<br>Giảm giá giới thiệu: -${escapeHtml(formatMoney(order.referralDiscountAmount, order.currencyCode))}</p>` : ""}
      <p style="font-size:18px;text-align:right"><strong>Tổng cộng: ${escapeHtml(formatMoney(order.total, order.currencyCode))}</strong></p>
    </div>
  </div>
</body></html>`;

  return {
    recipient: config.email.orderRecipient,
    sender: config.email.from,
    subject: `[Tiệm Tiện Lợi Mỹ Trân] Đơn hàng mới #${order.orderCode}`,
    text,
    html,
  };
}

export async function createOrderEmailLog(connection, orderId, email) {
  const [result] = await connection.execute(
    `INSERT INTO order_email_logs
      (order_id, recipient, sender, subject, text_body, html_body)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [orderId, email.recipient, email.sender, email.subject, email.text, email.html],
  );
  return result.insertId;
}

export async function deliverOrderEmail(logId) {
  const [rows] = await pool.execute("SELECT * FROM order_email_logs WHERE id = ? LIMIT 1", [logId]);
  const log = rows[0];
  if (!log) throw new Error("EMAIL_LOG_NOT_FOUND");

  let providerResponse = "";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.email.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `order-email-${log.order_id}-${log.id}`,
      },
      body: JSON.stringify({
        from: log.sender,
        to: [log.recipient],
        subject: log.subject,
        text: log.text_body,
        html: log.html_body,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    providerResponse = await response.text();
    let payload = {};
    try {
      payload = providerResponse ? JSON.parse(providerResponse) : {};
    } catch {
      payload = {};
    }
    if (!response.ok) throw new Error(payload.message || `RESEND_HTTP_${response.status}`);

    await pool.execute(
      `UPDATE order_email_logs
          SET status = 'sent', provider_message_id = ?, provider_response = ?,
              error_message = NULL, attempted_at = CURRENT_TIMESTAMP, sent_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [payload.id ?? null, providerResponse, logId],
    );
    console.info(JSON.stringify({ event: "order_email", logId, orderId: String(log.order_id), status: "sent", providerMessageId: payload.id ?? null }));
    return { status: "sent", providerMessageId: payload.id ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "EMAIL_SEND_FAILED";
    await pool.execute(
      `UPDATE order_email_logs
          SET status = 'failed', provider_response = ?, error_message = ?, attempted_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [providerResponse || null, message.slice(0, 4000), logId],
    );
    console.error(JSON.stringify({ event: "order_email", logId, orderId: String(log.order_id), status: "failed", error: message }));
    return { status: "failed", error: message };
  }
}

export async function handleResendWebhook(rawBody, headers) {
  const verifier = new Webhook(config.email.webhookSecret);
  const event = verifier.verify(rawBody, {
    "svix-id": headers.id,
    "svix-timestamp": headers.timestamp,
    "svix-signature": headers.signature,
  });
  const providerMessageId = event?.data?.email_id;
  if (!providerMessageId || typeof event.type !== "string") return { matched: false };

  const [rows] = await pool.execute(
    "SELECT id FROM order_email_logs WHERE provider_message_id = ? LIMIT 1",
    [providerMessageId],
  );
  const emailLog = rows[0];
  if (!emailLog) return { matched: false };

  const occurredAt = event.created_at ? new Date(event.created_at) : null;
  await pool.execute(
    `INSERT IGNORE INTO order_email_events
      (email_log_id, provider_event_id, event_type, payload, occurred_at)
     VALUES (?, ?, ?, ?, ?)`,
    [emailLog.id, headers.id, event.type, rawBody, occurredAt],
  );
  if (["email.bounced", "email.failed", "email.suppressed"].includes(event.type)) {
    await pool.execute(
      "UPDATE order_email_logs SET status = 'failed', error_message = ? WHERE id = ?",
      [`Resend event: ${event.type}`, emailLog.id],
    );
  }
  console.info(JSON.stringify({ event: "resend_webhook", emailLogId: String(emailLog.id), providerMessageId, type: event.type }));
  return { matched: true };
}
