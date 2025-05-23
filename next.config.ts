import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.yampi.me'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
