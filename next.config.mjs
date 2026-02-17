import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

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
    experimental: {
        workerThreads: false, // Turn off worker threads to see if it reduces overhead/hanging on some machines
        cpus: 1, // Limit to 1 CPU to reduce parallel fetching load during build
    }
};

export default withNextIntl(nextConfig);
