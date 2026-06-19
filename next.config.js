/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Turn off strict mode to prevent double rendering in drag-and-drop
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
        hostname: 'tan-quetzal-596149.hostingersite.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.hostingersite.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
