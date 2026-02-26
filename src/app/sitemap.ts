<<<<<<< HEAD
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

    try {
        const supabase = createAdminClient();

        // Dynamic Course Paths
        const { data: courses, error: coursesError } = await supabase
            .from('cursos')
            .select('slug, updated_at')
            .eq('activo', true)
            .eq('visible', true);

        if (coursesError) {
            console.error('Error fetching courses for sitemap:', coursesError);
        } else if (courses) {
            locales.forEach((locale) => {
                courses.forEach((course: any) => {
                    sitemapEntries.push({
                        url: `${baseUrl}/${locale}/courses/${course.slug}`,
                        lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    });
                });
            });
        }

        // Dynamic Module Paths
        // We use !inner to ensure we only get modules that belong to active and visible courses
        const { data: modules, error: modulesError } = await supabase
            .from('modulos')
            .select('id, updated_at, curso:curso_id!inner(activo, visible)')
            .eq('curso.activo', true)
            .eq('curso.visible', true);

        if (modulesError) {
            console.error('Error fetching modules for sitemap:', modulesError);
        } else if (modules) {
            locales.forEach((locale) => {
                modules.forEach((module: any) => {
                    // Although modulos has a slug column, the current routing uses ID.
                    // We stick to ID to ensure valid links.
                    sitemapEntries.push({
                        url: `${baseUrl}/${locale}/academy/module/${module.id}`,
                        lastModified: module.updated_at ? new Date(module.updated_at) : new Date(),
                        changeFrequency: 'weekly',
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
=======
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
    } catch (e) {
        console.error('Sitemap dynamic paths error:', e);
    }

    return sitemapEntries;
}
>>>>>>> pr-286
