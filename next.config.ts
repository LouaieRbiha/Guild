import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "enka.network",
        pathname: "/ui/**",
      },
      {
        protocol: "https",
        hostname: "gi.yatta.moe",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "genshin.jmp.blue",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
