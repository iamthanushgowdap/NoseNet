import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: '/ai', destination: '/results', permanent: false },
      { source: '/sensor', destination: '/connection', permanent: false },
      { source: '/experiments', destination: '/history', permanent: false },
      { source: '/samples', destination: '/run-test', permanent: false },
      { source: '/backup', destination: '/export', permanent: false },
      { source: '/login', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
