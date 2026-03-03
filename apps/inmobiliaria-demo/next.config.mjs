/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/realstate',
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
