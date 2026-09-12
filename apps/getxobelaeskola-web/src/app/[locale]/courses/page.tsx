import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import CoursesListClient from '@/components/courses/CoursesListClient';
import NewsletterSection from '@/components/sections/NewsletterSection';
import { getSeoAlternates } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isEu = locale === 'eu';

    const title = isEu ? 'Ikastaroak' : 'Cursos';
    const description = isEu
        ? 'Ezagutu gure bela, kayak eta nabigazio lizentzia ikastaroak Getxon. Formazio praktikoa eta teorikoa.'
        : 'En Getxo Bela Eskola ofrecemos cursos para todas las edades y niveles, siempre desde un enfoque cercano, progresivo y adaptado a cada persona.';

    return {
        title,
        description,
        alternates: getSeoAlternates('courses', locale),
        openGraph: {
            title,
            description,
            images: ['/images/course-raquero-students.webp']
        }
    };
}

export default async function CoursesPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const t = await getTranslations({ locale, namespace: 'courses_page' });
    const supabase = createClient();

    let categories: any[] = [];
    let allCourses: any[] = [];

    // Safe Static Fetching
    try {
        // Fetch categories
        const { data: catData } = await supabase
            .from('categorias')
            .select('*')
            .order('nombre_es');

        categories = catData || [];

        // Fetch ALL courses (no filtering here)
        const { data: coursesData } = await supabase
            .from('cursos')
            .select(`
                *,
                categoria:categoria_id (
                    id,
                    slug,
                    nombre_es,
                    nombre_eu
                )
            `)
            .eq('activo', true)
            .eq('visible', true)
            .order('created_at', { ascending: false });

        allCourses = coursesData || [];
    } catch (error) {
        console.error('Error loading courses for static build:', error);
        // Fallback or empty - handled by client empty state or fallback below
    }

    const fallbackCategories = [
        { id: 'cat-1', slug: 'vela-ligera', nombre_es: 'Vela Ligera', nombre_eu: 'Bela Arina' },
        { id: 'cat-2', slug: 'windsurf', nombre_es: 'Windsurf', nombre_eu: 'Windsurfa' },
        { id: 'cat-3', slug: 'cursos-adultos', nombre_es: 'Cursos Adultos', nombre_eu: 'Helduentzako Ikastaroak' },
        { id: 'cat-4', slug: 'cursos-infantiles', nombre_es: 'Cursos Infantiles', nombre_eu: 'Haurrentzako Ikastaroak' },
        { id: 'cat-5', slug: 'titulaciones', nombre_es: 'Titulaciones', nombre_eu: 'Titulazioak' },
        { id: 'cat-6', slug: 'crucero', nombre_es: 'Crucero', nombre_eu: 'Belaontzia' }
    ];

    // Comprehensive Fallback data reflecting the complete catalog
    const fallbackCourses = [
        {
            id: '1',
            slug: 'iniciacion-vela-ligera',
            nombre_es: 'Iniciación a la Vela Ligera',
            nombre_eu: 'Bela Arineko Hasiera',
            descripcion_es: 'Primer contacto con la navegación a vela. Aprende los fundamentos básicos de la vela en embarcaciones ligeras.',
            descripcion_eu: 'Lehen kontaktua belarekin. Ikasi bela arinaren oinarriak.',
            precio: 0,
            duracion_h: 20,
            nivel: 'iniciacion',
            categoria_id: 'cat-1',
            categoria: { id: 'cat-1', nombre_es: 'Vela Ligera', nombre_eu: 'Bela Arina' },
            imagen_url: '/images/courses/CursodeVelaLigera.webp'
        },
        {
            id: '2',
            slug: 'windsurf-1-sesion',
            nombre_es: 'Windsurf 1 Sesión',
            nombre_eu: 'Windsurf Saio 1',
            descripcion_es: 'Sesión individual de windsurf de 2 horas. Perfecto para probar.',
            descripcion_eu: 'Bi orduko windsurf saio indibiduala. Probatzeko bikaina.',
            precio: 40,
            duracion_h: 2,
            nivel: 'iniciacion',
            categoria_id: 'cat-2',
            categoria: { id: 'cat-2', nombre_es: 'Windsurf', nombre_eu: 'Windsurfa' },
            imagen_url: '/images/experiences/windsurf-mooring.jpg'
        },
        {
            id: '3',
            slug: 'windsurf-3-sesiones',
            nombre_es: 'Windsurf 3 Sesiones',
            nombre_eu: 'Windsurf 3 Saio',
            descripcion_es: 'Pack de 3 sesiones de windsurf de 2 horas cada una para consolidar técnica.',
            descripcion_eu: '3 saiotako windsurf paketea teknika hobetzeko.',
            precio: 100,
            duracion_h: 6,
            nivel: 'iniciacion',
            categoria_id: 'cat-2',
            categoria: { id: 'cat-2', nombre_es: 'Windsurf', nombre_eu: 'Windsurfa' },
            imagen_url: '/images/experiences/windsurf-mooring.jpg'
        },
        {
            id: '4',
            slug: 'iniciacion-adultos',
            nombre_es: 'Iniciación Adultos Vela',
            nombre_eu: 'Helduentzako Hasiera',
            descripcion_es: 'Curso de iniciación a la navegación a vela para adultos. 12 horas de formación práctica.',
            descripcion_eu: 'Helduentzako nabigazio ikastaroa (hasiera). 12 orduko prestakuntza praktikoa.',
            precio: 180,
            duracion_h: 12,
            nivel: 'iniciacion',
            categoria_id: 'cat-3',
            categoria: { id: 'cat-3', nombre_es: 'Cursos Adultos', nombre_eu: 'Helduentzako Ikastaroak' },
            imagen_url: '/images/J80.webp'
        },
        {
            id: '5',
            slug: 'campus-verano-getxo',
            nombre_es: 'Campus Verano (Haurrak)',
            nombre_eu: 'Udako Campusa (Haurrak)',
            descripcion_es: 'Campus de verano para niños de 5 a 21 años. 20 horas de diversión y vela.',
            descripcion_eu: '5 eta 21 urte bitarteko haurrendako udako campusa. 20 orduko dibertsioa eta bela.',
            precio: 130,
            duracion_h: 20,
            nivel: 'iniciacion',
            categoria_id: 'cat-4',
            categoria: { id: 'cat-4', nombre_es: 'Cursos Infantiles', nombre_eu: 'Haurrentzako Ikastaroak' },
            imagen_url: '/images/course-raquero-students.webp'
        },
        {
            id: '6',
            slug: 'licencia-navegacion',
            nombre_es: 'Licencia de Navegación',
            nombre_eu: 'Nabigazio Lizentzia',
            descripcion_es: 'Obtén tu Licencia de Navegación (Titulín) en 6 horas sin examen oficial.',
            descripcion_eu: 'Lortu zure Nabigazio Lizentzia 6 ordutan azterketa ofizialik gabe.',
            precio: 120,
            duracion_h: 6,
            nivel: 'iniciacion',
            categoria_id: 'cat-5',
            categoria: { id: 'cat-5', nombre_es: 'Titulaciones', nombre_eu: 'Titulazioak' },
            imagen_url: '/images/courses/PerfeccionamientoVela.webp'
        }
    ];

    const displayCategories = (categories && categories.length > 0) ? categories : fallbackCategories;
    const displayCourses = (allCourses && allCourses.length > 0) ? allCourses : fallbackCourses;

    return (
        <main className="min-h-[100dvh] w-full bg-nautical-black text-sea-foam selection:bg-accent selection:text-nautical-black">
            {/* Cinematic Header Section */}
            <section className="courses-header-section relative pt-[clamp(7.5rem,14vh,11rem)] pb-[clamp(1rem,3vh,4rem)] overflow-hidden w-full">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-brass-gold/5 blur-[100px] rounded-full -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-left">
                    <header className="max-w-4xl">
                        <span className="text-accent uppercase tracking-[0.6em] text-[clamp(0.65rem,0.8vw,0.875rem)] font-bold mb-2 sm:mb-4 block animate-fade-in-up">
                            {t('header_badge')}
                        </span>
                        <h1 className="text-[clamp(1.75rem,4vw,4.5rem)] font-display leading-[0.95] text-sea-foam mb-2 sm:mb-6 animate-reveal relative">
                            {t('header_title')} <br />
                            <span className="italic font-light text-brass-gold/90">{t('header_highlight')}</span>
                        </h1>
                        <p className="max-w-2xl text-sea-foam/60 font-light text-[clamp(0.85rem,1.2vw,1.25rem)] leading-relaxed border-l-2 border-sea-foam/10 pl-4 sm:pl-6 md:pl-8 mt-2 sm:mt-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                            {t('header_desc')}
                        </p>
                    </header>
                </div>
            </section>

            {/* Client-side Course List Area */}
            <CoursesListClient
                initialCourses={displayCourses}
                categories={displayCategories}
                locale={locale}
            />

            {/* Newsletter Section */}
            <NewsletterSection locale={locale} />

            {/* Minimal Background Decoration */}
            <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none z-0" />
        </main>
    );
}
