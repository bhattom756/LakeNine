import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/dashboard/:path*',
        destination: 'https://backend.spendingcalculator.xyz/dashboard/:path*',
      },
    ];
  },
};

export default nextConfig;
