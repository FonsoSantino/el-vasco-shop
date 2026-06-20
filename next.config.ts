import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  serverExternalPackages: ['better-sqlite3'],
  // Bundle the SQLite database file with every serverless function so it
  // can be copied to /tmp at runtime (Vercel's writable temp directory).
  outputFileTracingIncludes: {
    "/**": ["./database.db"],
  },
};

export default nextConfig;
