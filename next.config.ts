import type { NextConfig } from "next";
// /** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "adsng.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:6000/:path*", // Proxy to NestJS
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
