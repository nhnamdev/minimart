import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This storefront does not use server-only Next.js features. Exporting it as
  // static files avoids Vercel's server trace adapter and its missing nft file.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
