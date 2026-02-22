import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';
    const locales = ['es', 'eu', 'en', 'fr'];
    const staticPaths = ['', '/courses', '/academy', '/rental', '/about', '/contact'];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Static Paths
    locales.forEach((locale) => {
        staticPaths.forEach((path) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}${path}`,
                lastModified: new Date(),
                changeFrequency: path === '' ? 'daily' : 'weekly',
                priority: path === '' ? 1.0 : 0.8,
            });
        });
    });

    // Dynamic Course Paths
    try {
        const supabase = createAdminClient();
        const { data: courses } = await supabase
            .from('cursos')
            .select('slug')
            .eq('activo', true)
            .eq('visible', true) as { data: { slug: string }[] | null };

        if (courses) {
            locales.forEach((locale) => {
                courses.forEach((course) => {
                    sitemapEntries.push({
                        url: `${baseUrl}/${locale}/courses/${course.slug}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    });
                });
            });
        }

        // Dynamic Lesson Paths
        const { data: lessonsData } = await supabase
            .from('unidades_didacticas')
            .select(`
                id,
                slug,
                updated_at,
                modulo!inner (
                    curso!inner (
                        activo,
                        visible
                    )
                )
            `)
            .eq('modulo.curso.activo', true)
            .eq('modulo.curso.visible', true);

        const lessons = lessonsData as unknown as { id: string, slug: string, updated_at: string }[] | null;

        if (lessons) {
            locales.forEach((locale) => {
                lessons.forEach((lesson) => {
                    const identifier = lesson.slug || lesson.id;
                    sitemapEntries.push({
                        url: `${baseUrl}/${locale}/academy/unit/${identifier}`,
                        lastModified: new Date(lesson.updated_at),
                        changeFrequency: 'monthly',
                        priority: 0.6,
                    });
                });
            });
        }
    } catch (e) {
        console.error('Sitemap dynamic paths error:', e);
    }

    return sitemapEntries;
}
