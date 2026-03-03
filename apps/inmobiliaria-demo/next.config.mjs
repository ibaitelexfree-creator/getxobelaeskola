/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/controlmanager/realstate',
  optimizeFonts: false,
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
