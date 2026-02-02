import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/",
      destination: "/index.html",
    },
  ],
};

export default nextConfig;
