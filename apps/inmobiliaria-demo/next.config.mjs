/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/realstate',
  experimental: {
    // Turbopack root config removed as it's marked as invalid in this version
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
