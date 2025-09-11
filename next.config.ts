import type { NextConfig } from "next";
// /** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // hostname: "https://adsng.s3.eu-north-1.amazonaws.com",
        hostname: "cnsquad-staging.s3.eu-west-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "adsng.s3.eu-north-1.amazonaws.com", // ✅ fixed
        pathname: "/**", // allow all paths under this host
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
