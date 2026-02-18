import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { listGoogleEvents } from '@/lib/google-calendar';

const BookingSelector = dynamic(() => import('@/components/booking/BookingSelector'), { ssr: false });

import { Metadata } from 'next';

export async function generateMetadata({
    params: { locale, slug }
}: {
    params: { locale: string; slug: string }
}): Promise<Metadata> {
    const supabase = createClient();
    const { data: course } = await supabase
        .from('cursos')
        .select('*')
        .eq('slug', slug)
        .single();

    // Re-use fallback logic for metadata
    const fallbacks: Record<string, any> = {
        'iniciacion-j80': {
            nombre_es: 'Iniciación J80',
            nombre_eu: 'J80 Hastapena',
            descripcion_es: 'Iníciate en el mundo de la navegación a vela en veleros J80. Aprende maniobras básicas en Getxo.',
            descripcion_eu: 'Hasi nabigazio munduan J80 belaontzietan. Ikasi oinarrizko maniobrak Getxon.'
        },
        'perfeccionamiento-vela': {
            nombre_es: 'Perfeccionamiento Vela',
            nombre_eu: 'Bela Hobetzea',
            descripcion_es: 'Mejora tu técnica, táctica y seguridad a bordo. Navegación competitiva y autónoma.',
            descripcion_eu: 'Hobetu zure teknika, taktika eta segurtasuna ontzian. Nabigazio lehiakorra.'
        },
        'licencia-navegacion': {
            nombre_es: 'Licencia de Navegación',
            nombre_eu: 'Nabigazio Lizentzia',
            descripcion_es: 'Obtén tu titulación oficial en un solo día, sin examen. Válida para barcos de hasta 6m.',
            descripcion_eu: 'Lortu zure titulu ofiziala egun bakar batean, azterketarik gabe. 6 metrorainoko ontziak.'
        },
        'vela-ligera': {
            nombre_es: 'Curso de Vela Ligera',
            nombre_eu: 'Bela Arina Ikastaroa',
            descripcion_es: 'Entrenamientos en Optimist, Laser y 420. Ideal para formación continua escolar.',
            descripcion_eu: 'Optimist, Laser eta 420 ontzietan entrenamenduak. Eskola urtean zehar.'
        }
    };

    const displayCourse = course || fallbacks[slug];
    if (!displayCourse) return { title: 'Curso no encontrado' };

    const name = locale === 'es' ? displayCourse.nombre_es : displayCourse.nombre_eu;
    const description = locale === 'es' ? displayCourse.descripcion_es : displayCourse.descripcion_eu;

    return {
        title: name,
        description: description,
        openGraph: {
            title: name,
            description: description,
            images: [displayCourse.imagen_url || '/images/home-hero-sailing-action.webp']
        },
        twitter: {
            card: 'summary_large_image',
            title: name,
            description: description,
        }
    };
}

export async function generateStaticParams() {
    const slugs = ['iniciacion-j80', 'perfeccionamiento-vela', 'licencia-navegacion', 'vela-ligera'];
    const locales = ['es', 'eu', 'en', 'fr'];
    return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export default async function CourseDetailPage({
    params: { locale, slug }
}: {
    params: { locale: string; slug: string }
}) {
    interface Edition {
        id: string;
        fecha_inicio: string;
        fecha_fin: string;
        plazas_totales: number;
        plazas_ocupadas: number;
        is_calendar_event?: boolean;
    }

    interface CourseFallback {
        id: string;
        nombre_es: string;
        nombre_eu: string;
        descripcion_es: string;
        descripcion_eu: string;
        precio: number;
        duracion_h: number;
        nivel: string;
        imagen_url: string;
        detalles?: {
            es: string[];
            eu: string[];
        };
    }
    const supabase = createClient();

    // 1. Fetch main course data
    const { data: course } = await supabase
        .from('cursos')
        .select('*')
        .eq('slug', slug)
        .single();

    // 2. Fetch real sessions/editions (if table works)
    let dbEditions: Edition[] = [];
    try {
        const { data: editionsData } = await supabase
            .from('ediciones_curso')
            .select('*')
            .eq('curso_id', course?.id)
            .gte('fecha_inicio', new Date().toISOString())
            .order('fecha_inicio', { ascending: true });
        dbEditions = (editionsData as unknown as Edition[]) || [];
    } catch (e) {
        console.error('Fetch editions failed', e);
    }

    // 3. Fetch from Google Calendar
    let calendarEditions: Edition[] = [];
    try {
        const events = await listGoogleEvents();
        // Match events that contain "J80" or course name keywords
        const searchTerms = [
            'J80',
            slug.split('-').join(' '),
            course?.nombre_es,
            course?.nombre_eu
        ].filter(Boolean).map(s => s!.toUpperCase());

        calendarEditions = events
            .filter((event: any) => {
                const summary = (event.summary || '').toUpperCase();
                const description = (event.description || '').toUpperCase();
                return searchTerms.some(term => summary.includes(term) || description.includes(term));
            })
            .map((event: any) => ({
                id: `ext_${event.id}`,
                fecha_inicio: event.start?.dateTime || event.start?.date,
                fecha_fin: event.end?.dateTime || event.end?.date,
                plazas_totales: 4, // Default according to user request
                plazas_ocupadas: 0,
                is_calendar_event: true,
                google_event_id: event.id
            }));
    } catch (e) {
        console.error('Fetch calendar events failed', e);
    }

    // 4. Merge and deduplicate (roughly by date)
    const allRealEditions = [...dbEditions, ...calendarEditions].sort(
        (a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
    );

    // 3. Fallback Registry (Always active to ensure UI works)
    const fallbacks: Record<string, CourseFallback> = {
        'iniciacion-j80': {
            id: 'bc39dfeb-cd99-4bae-a5ae-e363d5a77d61',
            nombre_es: 'Iniciación J80',
            nombre_eu: 'J80 Hastapena',
            descripcion_es: 'Iníciate en el mundo de la navegación a vela en veleros J80. Cursos de 20 horas en grupos reducidos para aprender las maniobras básicas y disfrutar de la ría y el Abra.',
            descripcion_eu: 'Hasi nabigazio munduan J80 belaontzietan. 20 orduko ikastaroak talde txikietan, oinarrizko maniobrak ikasteko eta Abrako badiaz gozatzeko.',
            precio: 150,
            duracion_h: 20,
            nivel: 'iniciacion',
            imagen_url: '/images/courses/IniciacionJ80.png',
            detalles: {
                es: ['Maniobras básicas a vela', 'Seguridad en puerto y mar', 'Grupos reducidos (mín. 4)', '20 horas de formación'],
                eu: ['Oinarrizko bela maniobrak', 'Segurtasuna portuan eta itsasoan', 'Talde txikiak (gutxienez 4)', '20 orduko prestakuntza']
            }
        },
        'perfeccionamiento-vela': {
            id: 'd8db9369-020c-4ffb-9a91-8dec67aacb0c',
            nombre_es: 'Perfeccionamiento Vela',
            nombre_eu: 'Bela Hobetzea',
            descripcion_es: 'Mejora tu técnica, táctica y seguridad a bordo. Dirigido a quienes ya tienen experiencia y buscan navegar de forma más competitiva y autónoma.',
            descripcion_eu: 'Hobetu zure teknika, taktika eta segurtasuna ontzian. Esperientzia dutenentzat eta era lehiakorragoan nabigatu nahi dutenentzat zuzendua.',
            precio: 220,
            duracion_h: 20,
            nivel: 'intermedio',
            imagen_url: '/images/courses/PerfeccionamientoVela.png',
            detalles: {
                es: ['Técnica avanzada de trimado', 'Táctica de regata', 'Navegación nocturna básica', 'Perfeccionamiento de maniobras'],
                eu: ['Trimatzeko teknika aurreratua', 'Estropada taktika', 'Oinarrizko gaueko nabigazioa', 'Maniobrak hobetzea']
            }
        },
        'licencia-navegacion': {
            id: 'f67462a1-fb29-4188-b298-bd529b457853',
            nombre_es: 'Licencia de Navegación',
            nombre_eu: 'Nabigazio Lizentzia',
            descripcion_es: 'Obtén tu titulación oficial en un solo día, sin examen. Válida para barcos de hasta 6 metros y motos náuticas de hasta 55 CV.',
            descripcion_eu: 'Lortu zure titulu ofiziala egun bakar batean, azterketarik gabe. 6 metrorainoko ontzi eta 55 CV-rainoko motorrentzat balio du.',
            precio: 149,
            duracion_h: 6,
            nivel: 'iniciacion',
            imagen_url: '/images/courses/LicenciadeNavegacion.png',
            detalles: {
                es: ['Título oficial sin examen', 'Gobierno de barcos hasta 6m', 'Motos náuticas hasta 55CV', 'Navegación diurna (2 millas)'],
                eu: ['Azterketarik gabeko titulu ofiziala', '6 metrorainoko ontzien gobernua', '55CV-rainoko motorrak', 'Eguneko nabigazioa (2 milia)']
            }
        },
        'vela-ligera': {
            id: '5eafb0a1-72ae-4d4b-85a1-7ab392f71894',
            nombre_es: 'Curso de Vela Ligera',
            nombre_eu: 'Bela Arina Ikastaroa',
            descripcion_es: 'Entrenamientos en Optimist, Laser y 420. Ideal para formación continua durante todo el año escolar, con entrenamientos los fines de semana.',
            descripcion_eu: 'Optimist, Laser eta 420 ontzietan entrenamenduak. Eskola urtean zehar jarraitzeko ezin hobea, asteburuetako entrenamenduekin.',
            precio: 100,
            duracion_h: 12,
            nivel: 'iniciacion',
            imagen_url: '/images/courses/CursodeVelaLigera.png',
            detalles: {
                es: ['Optimist, Laser y 420', 'Octubre a Junio', '3 domingos al mes', 'Incluye monitor y equipo'],
                eu: ['Optimist, Laser eta 420', 'Urritik Ekainera', 'Hilean 3 igande', 'Monitorea eta ekipoa barne']
            }
        }
    };

    const displayCourse = course || fallbacks[slug];

    if (!displayCourse) {
        notFound();
    }

    const displayEditions = allRealEditions;

    const t = await getTranslations('courses');
    const name = locale === 'es' ? displayCourse.nombre_es : displayCourse.nombre_eu;
    const description = locale === 'es' ? displayCourse.descripcion_es : displayCourse.descripcion_eu;

    return (
        <main className="min-h-screen bg-nautical-deep" suppressHydrationWarning>
            <div className="fixed inset-0 bg-nautical-deep z-0" />

            <div className="relative z-10 pt-32 pb-24 px-6">
                <div className="container mx-auto">
                    <Link href={`/${locale}/courses`} className="text-sm uppercase tracking-[0.3em] text-accent mb-12 inline-block hover:pl-2 transition-all">
                        ← {t('back_to_catalog')}
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-12">
                            <h1 className="text-6xl md:text-8xl font-display leading-tight">{name}</h1>
                            <div className="w-24 h-px bg-accent/30" />
                            <p className="text-xl font-light leading-relaxed text-foreground/80">
                                {description}
                            </p>

                            <div className="flex flex-wrap gap-10 text-xs uppercase tracking-widest font-bold text-sea-foam/50 border-t border-white/5 pt-10">
                                <div>
                                    <p className="text-accent mb-1">{t('duration')}</p>
                                    <p className="text-foreground">{displayCourse.duracion_h}h</p>
                                </div>
                                <div>
                                    <p className="text-accent mb-1">Nivel</p>
                                    <p className="text-foreground">{t(`levels.${displayCourse.nivel}`)}</p>
                                </div>
                                <div>
                                    <p className="text-accent mb-1">Inversión</p>
                                    <p className="text-brass-gold text-lg">{displayCourse.precio}€</p>
                                </div>
                            </div>

                            {displayCourse.detalles && (
                                <div className="space-y-4 pt-12">
                                    <h4 className="text-xs uppercase tracking-widest font-bold text-accent">Lo que aprenderás</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(locale === 'es' ? displayCourse.detalles.es : displayCourse.detalles.eu).map((detail: string, i: number) => (
                                            <li key={i} className="flex items-center gap-3 text-sm font-light text-foreground/70">
                                                <div className="w-1 h-1 bg-accent/40 rounded-full" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="space-y-12">
                            <div className="relative h-[450px] rounded-sm overflow-hidden border border-white/10 shadow-2xl">
                                <Image
                                    src={displayCourse.imagen_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5997?auto=format&fit=crop&q=80&w=2074'}
                                    alt={name}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="card-luxury p-10 bg-white/5 backdrop-blur-xl border border-white/10">
                                <h3 className="font-display text-4xl mb-6 text-sea-foam">Reserva tu plaza</h3>
                                <BookingSelector
                                    editions={displayEditions}
                                    coursePrice={displayCourse.precio}
                                    courseId={displayCourse.id}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
