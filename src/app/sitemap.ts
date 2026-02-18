import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

    // 1. Static Routes
    const staticRoutes = [
        '/',
        '/about/',
        '/contact/',
        '/courses/',
        '/rental/',
        '/academy/'
    ];

    // 2. Fetch Dynamic Courses
    const supabase = createClient();
    const { data: courses } = await supabase
        .from('cursos')
        .select('slug, updated_at');

    // 3. Generate entries
    // Note: Next.js sitemap type expects an array of objects
    const entries: MetadataRoute.Sitemap = [];

    // Add static routes
    staticRoutes.forEach(route => {
        entries.push({
            url: `${baseUrl}/es${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: route === '/' ? 1 : 0.8,
        });
        entries.push({
            url: `${baseUrl}/eu${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: route === '/' ? 1 : 0.8,
        });
    });

    // Add dynamic course routes
    if (courses) {
        // @ts-ignore
        courses.forEach((course: any) => {
            entries.push({
                url: `${baseUrl}/es/courses/${course.slug}/`,
                lastModified: new Date(course.updated_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.9,
            });
            entries.push({
                url: `${baseUrl}/eu/courses/${course.slug}/`,
                lastModified: new Date(course.updated_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.9,
            });
        });
    }

    return entries;
}
