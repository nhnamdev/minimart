import type { NextConfig } from "next";

const mediaBaseUrl = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null;

const nextConfig: NextConfig = {
  // This storefront does not use server-only Next.js features. Exporting it as
  // static files avoids Vercel's server trace adapter and its missing nft file.
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: mediaBaseUrl
      ? [{
          protocol: mediaBaseUrl.protocol === "http:" ? "http" : "https",
          hostname: mediaBaseUrl.hostname,
          port: mediaBaseUrl.port,
          pathname: "/**",
        }]
      : [],
  },
};

export default nextConfig;
