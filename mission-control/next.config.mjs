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
<<<<<<< HEAD

=======
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
>>>>>>> pr-286
    transpilePackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/haptics',
        '@capacitor/network',
        '@capacitor/push-notifications',
        '@capacitor/status-bar',
<<<<<<< HEAD
        '@capacitor/browser',
        '@capacitor/device',
        '@capacitor/app'
=======
>>>>>>> pr-286
    ],
};

export default nextConfig;
