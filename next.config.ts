import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    staleTimes: {
      dynamic: 300,
    },
  },
};

export default nextConfig;
