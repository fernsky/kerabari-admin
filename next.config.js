await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
};

export default config;
