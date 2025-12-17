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
  // Menentukan root directory untuk mengatasi warning multiple lockfiles
  turbopack: {
    // Menentukan root directory secara eksplisit ke folder frontend
    root: "D:\\3. Doc Yoga\\Layang\\Project\\39. Halo Optom App\\halo-optom-project\\frontend"
  },
};

export default nextConfig;
