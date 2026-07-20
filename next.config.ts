import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "storage.resurva.my.id",
      },
      {
        protocol: "http",
        hostname: "storage.resurva.my.id",
      },
      {
        protocol: "https",
        hostname: "api.resurva.my.id",
      },
      {
        protocol: "http",
        hostname: "api.resurva.my.id",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
