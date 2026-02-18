import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';
    const locales = ['es', 'eu', 'en', 'fr'];
    const paths = ['', '/courses', '/academy', '/rental', '/about', '/contact'];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    locales.forEach((locale) => {
        paths.forEach((path) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}${path}`,
                lastModified: new Date(),
                changeFrequency: path === '' ? 'daily' : 'weekly',
                priority: path === '' ? 1.0 : 0.8,
            });
        });
    });

    return sitemapEntries;
}
