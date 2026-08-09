import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This storefront does not use server-only Next.js features. Exporting it as
  // static files avoids Vercel's server trace adapter and its missing nft file.
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ee0be820c6424699aa4fee1bfa3df623.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
