import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-font-assets',
                expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-image-assets',
                expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\/api\/academy\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'academy-api',
                expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
                networkTimeoutSeconds: 10,
            },
        },
        {
            urlPattern: /\/api\/tools\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'tools-api',
                expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'others-api',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
            },
        },
    ],
});

const isCapacitor = process.env.IS_CAPACITOR === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    images: {
        unoptimized: isCapacitor, // Only unoptimized for Capacitor/Static export
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
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
    staticPageGenerationTimeout: 300, // Increase timeout to 5 minutes
    transpilePackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/ios',
        '@capacitor/geolocation',
        '@capacitor/network',
        '@capacitor/push-notifications'
    ],
    ...(isCapacitor ? {} : {
        async headers() {
            return [
                {
                    source: '/:path*',
                    headers: [
                        {
                            key: 'X-Frame-Options',
                            value: 'DENY',
                        },
                        {
                            key: 'X-Content-Type-Options',
                            value: 'nosniff',
                        },
                        {
                            key: 'Referrer-Policy',
                            value: 'strict-origin-when-cross-origin',
                        },
                        {
                            key: 'Permissions-Policy',
                            value: 'camera=(), microphone=(), geolocation=()',
                        },
                    ],
                },
            ];
        },
    }),
};

export default withPWA(withNextIntl(nextConfig));
