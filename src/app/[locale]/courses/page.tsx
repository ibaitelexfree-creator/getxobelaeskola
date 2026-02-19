import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import CourseCard from '@/components/courses/CourseCard';
import CourseFilters from '@/components/courses/CourseFilters';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isEu = locale === 'eu';

    const title = isEu ? 'Ikastaroak' : 'Cursos';
    const description = isEu
        ? 'Ezagutu gure bela, kayak eta nabigazio lizentzia ikastaroak Getxon. Formazio praktikoa eta teorikoa.'
        : 'Explora nuestro catálogo de cursos de vela, kayak y licencias de navegación en Getxo. Formación náutica para todos los niveles.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: ['/images/course-raquero-students.webp']
        }
    };
}

export default async function CoursesPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: { category?: string };
}) {
    const t = await getTranslations({ locale, namespace: 'courses_page' });
    const supabase = createClient();

    // Fetch all categories for the filter bar
    const { data: categories } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre_es');

    let query = supabase
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
        .eq('visible', true);

    if (searchParams.category) {
        query = query.eq('categoria_id', searchParams.category);
    }

    const { data: courses } = await query.order('created_at', { ascending: false });

    // Fallback data reflecting the new catalog
    const fallbackCourses = [
        {
            id: '1',
            slug: 'iniciacion-adultos',
            nombre_es: 'Iniciación Adultos',
            nombre_eu: 'Helduentzako Hasiera',
            descripcion_es: 'Curso de iniciación a la navegación para adultos. 12 horas de formación práctica.',
            descripcion_eu: 'Helduentzako nabigazio ikastaroa (hasiera). 12 orduko prestakuntza praktikoa.',
            precio: 180,
            duracion_h: 12,
            nivel: 'iniciacion',
            categoria: { nombre_es: 'Cursos Adultos', nombre_eu: 'Helduentzako Ikastaroak' },
            imagen_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5997?q=70&w=800'
        },
        {
            id: '2',
            slug: 'campus-verano-getxo',
            nombre_es: 'Campus Verano (Haurrak)',
            nombre_eu: 'Udako Campusa (Haurrak)',
            descripcion_es: 'Campus de verano para niños de 5 a 21 años. 20 horas de diversión y vela.',
            descripcion_eu: '5 eta 21 urte bitarteko haurrendako udako campusa. 20 orduko dibertsioa eta bela.',
            precio: 130,
            duracion_h: 20,
            nivel: 'iniciacion',
            categoria: { nombre_es: 'Cursos Infantiles', nombre_eu: 'Haurrentzako Ikastaroak' },
            imagen_url: '/images/course-raquero-students.webp'
        },
        {
            id: '3',
            slug: 'windsurf-iniciacion',
            nombre_es: 'Iniciación Windsurf',
            nombre_eu: 'Windsurf Hasiera',
            descripcion_es: 'Aprende los fundamentos del windsurf en 5 sesiones de 2 horas.',
            descripcion_eu: 'Ikasi windsurfeko oinarriak 5 saiotan (2 ordu saio bakoitzeko).',
            precio: 150,
            duracion_h: 10,
            nivel: 'iniciacion',
            categoria: { nombre_es: 'Windsurf', nombre_eu: 'Windsurfa' },
            imagen_url: '/images/courses/PerfeccionamientoVela.webp'
        }
    ];

    const displayCourses = (courses && courses.length > 0) ? courses : fallbackCourses;

    return (
        <main className="min-h-screen bg-nautical-black text-white selection:bg-accent selection:text-nautical-black">
            {/* Cinematic Header Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-brass-gold/5 blur-[100px] rounded-full -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 text-center md:text-left">
                    <header className="max-w-4xl">
                        <span className="text-accent uppercase tracking-[0.6em] text-sm font-bold mb-8 block animate-fade-in-up">
                            {t('header_badge')}
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-display leading-[0.9] text-white mb-12 animate-reveal relative">
                            {t('header_title')} <br />
                            <span className="italic font-light text-brass-gold/90">{t('header_highlight')}</span>
                        </h1>
                        <p className="max-w-2xl text-foreground/60 font-light text-xl leading-relaxed border-l-2 border-white/5 pl-12 mt-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                            {t('header_desc')}
                        </p>
                    </header>
                </div>
            </section>

            {/* Courses Catalogue Grid */}
            <section className="pb-48 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <CourseFilters categories={categories || []} locale={locale} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {displayCourses.map((course) => (
                            <CourseCard key={course.id} course={course} locale={locale} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Minimal Background Background Decoration */}
            <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none z-0" />
        </main>
    );
}
