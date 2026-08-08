import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

import { config } from "./config.mjs";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

function safeSegment(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "image";
}

export function mediaUrl(key) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function uploadImage(buffer, folder, slug) {
  const optimized = await sharp(buffer, { failOn: "error", limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  const key = `${safeSegment(folder)}/${safeSegment(slug)}/${randomUUID()}.webp`;

  await client.send(new PutObjectCommand({
    Bucket: config.r2.bucket,
    Key: key,
    Body: optimized,
    ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  }));

  return { key, url: mediaUrl(key), size: optimized.length };
}

export async function getImage(key, range) {
  return client.send(new GetObjectCommand({
    Bucket: config.r2.bucket,
    Key: key,
    ...(range ? { Range: range } : {}),
  }));
}

export async function deleteImage(key) {
  if (!key) return;
  await client.send(new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: key }));
}
