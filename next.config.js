/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Turn off strict mode to prevent double rendering in drag-and-drop

  // Required for Hostinger Node.js deployment - bundles into self-contained server
  // This fixes ChunkLoadError: Loading chunk failed (404 on /_next/static/chunks/)
  output: 'standalone',

  // Ensure trailing slashes work correctly on Hostinger subdomain
  trailingSlash: false,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mediumturquoise-spoonbill-121355.hostingersite.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.hostingersite.com',
        pathname: '/**',
      },
    ],
  },

  // Fix webpack chunk loading on Hostinger by ensuring public path is correct
  webpack: (config, { isServer }) => {
    return config;
  },
};

module.exports = nextConfig;

