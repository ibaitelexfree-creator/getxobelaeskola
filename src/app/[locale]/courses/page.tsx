import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import CourseCard from '@/components/courses/CourseCard';
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
            images: ['https://getxobelaeskola.com/images/course-raquero-students.webp']
        }
    };
}

export default async function CoursesPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const t = await getTranslations({ locale, namespace: 'courses_page' });
    const supabase = createClient();
    const { data: courses } = await supabase
        .from('cursos')
        .select('*')
        .eq('activo', true)
        .eq('visible', true)
        .order('created_at', { ascending: false });

    // Fallback data if DB is empty or connection fails during dev
    const fallbackCourses = [
        {
            id: '1',
            slug: 'iniciacion-j80',
            nombre_es: 'Iniciación J80',
            nombre_eu: 'J80 Hastapena',
            descripcion_es: 'Iníciate en la navegación a vela en veleros J80. Cursos de 20 horas en grupos reducidos.',
            descripcion_eu: 'Hasi nabigazioan J80 belaontzietan. 20 orduko ikastaroak talde txikietan.',
            precio: 150,
            duracion_h: 20,
            nivel: 'iniciacion',
            imagen_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5997?q=80&w=2074'
        },
        {
            id: '2',
            slug: 'vela-ligera',
            nombre_es: 'Curso de Vela Ligera',
            nombre_eu: 'Bela Arina Ikastaroa',
            descripcion_es: 'Entrenamientos en Optimist, Laser y 420. Aprende a navegar en barcos colectivos e individuales.',
            descripcion_eu: 'Optimist, Laser eta 420 ontzietan entrenamenduak. Ikasi belaontzi kolektibo eta indibidualetan nabigatzen.',
            precio: 100,
            duracion_h: 12,
            nivel: 'iniciacion',
            imagen_url: '/images/course-raquero-students.webp'
        },
        {
            id: '5',
            slug: 'curso-kayak',
            nombre_es: 'Curso de Kayak',
            nombre_eu: 'Kayak Ikastaroa',
            descripcion_es: 'Aprende las técnicas básicas de paleo y seguridad en kayak individual.',
            descripcion_eu: 'Ikasi kayak indibidualean paleatzeko oinarrizko teknikak eta segurtasuna.',
            precio: 60,
            duracion_h: 4,
            nivel: 'iniciacion',
            imagen_url: '/images/course-kayak-yellow-single.jpg'
        },
        {
            id: '6',
            slug: 'piragua-competicion-individual',
            nombre_es: 'Piragua Competición Individual',
            nombre_eu: 'Banakako Piragua Txapelketa',
            descripcion_es: 'Perfecciona tu técnica en piraguas de competición individuales.',
            descripcion_eu: 'Hobetu zure teknika banakako piragua txapelketan.',
            precio: 80,
            duracion_h: 6,
            nivel: 'avanzado',
            imagen_url: '/images/course-piragua-competition-single.jpg'
        },
        {
            id: '7',
            slug: 'piragua-competicion-doble',
            nombre_es: 'Piragua Competición Doble',
            nombre_eu: 'Bikoitzako Piragua Txapelketa',
            descripcion_es: 'Entrenamientos en equipo para piraguas de competición dobles.',
            descripcion_eu: 'Taldekako entrenamenduak bikoitzako piragua txapelketan.',
            precio: 120,
            duracion_h: 8,
            nivel: 'avanzado',
            imagen_url: '/images/course-piragua-competition-double.jpg'
        },
        {
            id: '3',
            slug: 'licencia-navegacion',
            nombre_es: 'Licencia de Navegación',
            nombre_eu: 'Nabigazio Lizentzia',
            descripcion_es: 'Obtén tu titulación oficial en un solo día, sin examen.',
            descripcion_eu: 'Lortu zure titulu ofiziala egun bakar batean, azterketarik gabe.',
            precio: 149,
            duracion_h: 6,
            nivel: 'iniciacion',
            imagen_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094'
        },
        {
            id: '4',
            slug: 'perfeccionamiento-vela',
            nombre_es: 'Perfeccionamiento Vela',
            nombre_eu: 'Bela Hobetzea',
            descripcion_es: 'Mejora tu técnica, táctica y nivel de seguridad a bordo.',
            descripcion_eu: 'Hobetu zure teknika, taktika eta segurtasun maila ontzian.',
            precio: 220,
            duracion_h: 20,
            nivel: 'intermedio',
            imagen_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1974'
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
