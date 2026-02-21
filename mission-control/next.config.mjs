const isCapacitor = process.env.IS_CAPACITOR === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    compress: true,
    poweredByHeader: false,
    output: isCapacitor ? 'export' : 'standalone',
    experimental: {
        serverExternalPackages: [
            '@capacitor/core',
            '@capacitor/android',
            '@capacitor/haptics',
            '@capacitor/network',
            '@capacitor/push-notifications',
            '@capacitor/status-bar',
        ],
    },
    transpilePackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/haptics',
        '@capacitor/network',
        '@capacitor/push-notifications',
        '@capacitor/status-bar',
    ],
};

export default nextConfig;
