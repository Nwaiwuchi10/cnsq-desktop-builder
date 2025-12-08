import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cnsquad-prod.s3.eu-west-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cnsquad-staging.s3.eu-west-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "adsng.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:6000/:path*",
      },
    ];
  },
};

export default nextConfig;
// import type { NextConfig } from "next";
// // /** @type {import('next').NextConfig} */
// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "cnsquad-prod.s3.eu-west-2.amazonaws.com",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "cnsquad-staging.s3.eu-west-2.amazonaws.com",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "adsng.s3.eu-north-1.amazonaws.com", //
//         pathname: "/**", // allow all paths under this host
//       },
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//         port: "",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "randomuser.me",
//         port: "",
//         pathname: "/**",
//       },
//     ],
//   },
//   eslint: {
//     // Ignore ESLint errors during builds (Vercel won't fail)
//     ignoreDuringBuilds: true,
//   },
//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*",
//         destination: "http://localhost:6000/:path*", // Proxy to NestJS
//       },
//     ];
//   },
//   // /* config options here */
//   // transpilePackages: ["emoji-mart"],
// };

// export default nextConfig;
