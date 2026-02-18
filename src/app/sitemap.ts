import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';
    const locales = ['es', 'en', 'eu', 'fr'];

    // 1. Static Routes
    const staticRoutes = [
        '/',
        '/about/',
        '/contact/',
        '/courses/',
        '/rental/',
        '/academy/',
        '/privacy/',
        '/cookies/'
    ];

    // 2. Fetch Dynamic Courses
    const supabase = createClient();
    const { data: courses } = await supabase
        .from('cursos')
        .select('slug, updated_at');

    const entries: MetadataRoute.Sitemap = [];

    // Add static routes for all locales
    locales.forEach(locale => {
        staticRoutes.forEach(route => {
            const isHome = route === '/';
            entries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: isHome ? 'daily' : 'weekly',
                priority: isHome ? 1.0 : 0.8,
            });
        });
    });

    // Add dynamic course routes for all locales
    if (courses) {
        (courses as any[]).forEach((course) => {
            locales.forEach(locale => {
                entries.push({
                    url: `${baseUrl}/${locale}/courses/${course.slug}/`,
                    lastModified: new Date(course.updated_at || new Date()),
                    changeFrequency: 'weekly',
                    priority: 0.9,
                });
            });
        });
    }

    return entries;
}
