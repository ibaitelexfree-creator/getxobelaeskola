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
    serverExternalPackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/haptics',
        '@capacitor/network',
        '@capacitor/push-notifications',
        '@capacitor/status-bar',
        '@capacitor/browser',
        '@capacitor/device',
        '@capacitor/app'
    ],
    transpilePackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/haptics',
        '@capacitor/network',
        '@capacitor/push-notifications',
        '@capacitor/status-bar',
        '@capacitor/browser',
        '@capacitor/device',
        '@capacitor/app'
    ],
};

export default nextConfig;
