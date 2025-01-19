await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  ignoreBuildErrors: true,
  images: {
    domains: ["storage.digprofile.com"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "storage.digprofile.com",
        port: "50000",
        pathname: "/**",
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
};

export default config;
