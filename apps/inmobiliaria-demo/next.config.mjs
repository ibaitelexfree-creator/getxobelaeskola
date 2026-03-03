/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/controlmanager/realstate',
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
