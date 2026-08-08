import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel provides its own deployment adapter and output pipeline.
  // Keep standalone output only for Docker/Coolify builds.
  output: process.env.VERCEL === "1" ? undefined : "standalone",
};

export default nextConfig;
