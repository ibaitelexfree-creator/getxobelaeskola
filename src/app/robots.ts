import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/private/',
                '/api/',
                '/admin/',
                '/**/student/dashboard/' // Disallow dashboard in any locale
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
