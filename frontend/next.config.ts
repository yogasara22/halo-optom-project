import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
  },

  // Optimize package imports (tree shaking)
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'react-icons',
    ],
  },
};

export default nextConfig;
