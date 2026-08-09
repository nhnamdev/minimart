import "dotenv/config";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  appUrl: required("APP_URL").replace(/\/$/, ""),
  database: {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT ?? 3306),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
  },
  admin: {
    username: required("ADMIN_USERNAME"),
    password: required("ADMIN_PASSWORD"),
  },
  jwtSecret: required("JWT_SECRET"),
  r2: {
    accountId: required("R2_ACCOUNT_ID"),
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    bucket: required("R2_BUCKET"),
    publicUrl: required("R2_PUBLIC_URL").replace(/\/$/, ""),
  },
};

if (!Number.isInteger(config.port) || config.port < 1) {
  throw new Error("PORT must be a valid TCP port");
}
