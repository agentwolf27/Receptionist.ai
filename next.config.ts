import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Keep server actions enabled (default) and allow form data up to 2MB
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
