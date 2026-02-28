import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const isCapacitor = process.env.IS_CAPACITOR === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    images: {
        unoptimized: isCapacitor,
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'images.pexels.com' },
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'getxobelaeskola.cloud' },
        ],
    },
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    compress: true,
    poweredByHeader: false,
    output: isCapacitor ? 'export' : 'standalone',
    staticPageGenerationTimeout: 600,
    // Add transpile only if needed, currently removing to rule out conflicts
    transpilePackages: isCapacitor ? [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/ios',
        '@capacitor/geolocation',
        '@capacitor/network',
        '@capacitor/push-notifications'
    ] : [],
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbledhifomblirxurtyv.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjIxOTcsImV4cCI6MjA4NjE5ODE5N30.zja6S9AAEpZETNgt6aFEm0PCVq6gIORZ7hfUETKJyhM',
    },
    async headers() {
        if (isCapacitor) return [];
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
    async redirects() {
        if (isCapacitor) return [];
        return [
            { source: '/admin', destination: '/es/staff', permanent: false },
            { source: '/:locale/admin', destination: '/:locale/staff', permanent: false }
        ];
    },
};

export default withNextIntl(nextConfig);

