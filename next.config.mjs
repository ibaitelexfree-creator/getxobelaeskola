import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const isCapacitor = process.env.IS_CAPACITOR === 'true';

const withPWA = withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'google-fonts-webfonts',
                    expiration: {
                        maxEntries: 4,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                },
            },
            {
                urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'google-fonts-stylesheets',
                    expiration: {
                        maxEntries: 4,
                        maxAgeSeconds: 60 * 60 * 24 * 7,
                    },
                },
            },
            {
                urlPattern: /\/api\/academy\/unit\/.*$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'academy-units-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                    },
                },
            },
            {
                urlPattern: /\/api\/academy\/module\/.*$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'academy-modules-cache',
                    expiration: {
                        maxEntries: 20,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                    },
                },
            },
            {
                urlPattern: /\/api\/academy\/nomenclature.*$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'academy-nomenclature-cache',
                    expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                    },
                },
            },
            {
                urlPattern: /\/api\/tools\/.*$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'academy-tools-cache',
                    expiration: {
                        maxEntries: 20,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                    },
                },
            },
            {
                urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-font-assets',
                    expiration: {
                        maxEntries: 4,
                        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
                    },
                },
            },
            {
                urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-image-assets',
                    expiration: {
                        maxEntries: 64,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                    },
                },
            },
            {
                urlPattern: /\.(?:js)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-js-assets',
                    expiration: {
                        maxEntries: 32,
                        maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                    },
                },
            },
            {
                urlPattern: /\.(?:css|less)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-style-assets',
                    expiration: {
                        maxEntries: 32,
                        maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                    },
                },
            },
            {
                urlPattern: /\/_next\/image\?url=.+$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'next-image',
                    expiration: {
                        maxEntries: 64,
                        maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                    },
                },
            },
            {
                urlPattern: /\.(?:mp3|wav|ogg)$/i,
                handler: 'CacheFirst',
                options: {
                    rangeRequests: true,
                    cacheName: 'static-audio-assets',
                    expiration: {
                        maxEntries: 32,
                        maxAgeSeconds: 60 * 60 * 24, // 24 Hours
                    },
                },
            },
        ],
    },
});

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
            {
                protocol: 'https',
                hostname: 'getxobelaeskola.cloud',
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
    serverExternalPackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/ios',
        '@capacitor/geolocation',
        '@capacitor/network',
        '@capacitor/push-notifications'
    ],

    transpilePackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/ios',
        '@capacitor/geolocation',
        '@capacitor/network',
        '@capacitor/push-notifications'
    ],
    async headers() {
        if (isCapacitor) return [];
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
                        value: 'camera=(self), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
};

export default withPWA(withNextIntl(nextConfig));
