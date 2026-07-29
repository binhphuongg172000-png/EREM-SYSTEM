import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,
  allowedDevOrigins: [
    "192.168.2.74:3000",
    "192.168.2.74",
    "localhost:3000",
    "0.0.0.0:3000"
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
