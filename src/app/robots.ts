import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxo-sailing-school.vercel.app';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/private/',
                '/api/',
                '/staff/',
                '/admin/',
                '/student/dashboard/' // Don't index student dashboards
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
