import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce hydration mismatches
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  // Ensure consistent rendering
  reactStrictMode: true,
};

export default nextConfig;
