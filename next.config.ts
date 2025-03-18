import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [],
  },
  
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

export default nextConfig;