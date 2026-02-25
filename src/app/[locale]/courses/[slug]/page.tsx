import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
// import BookingSelector from '@/components/courses/BookingSelector';
import Image from 'next/image';
import Link from 'next/link';
// import JsonLd from '@/components/seo/JsonLd';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { slug, locale } }: { params: { slug: string; locale: string } }) {
    return {
        title: `Curso ${slug} | Getxo Bela Eskola`,
        description: 'Aprende a navegar en nuestra escuela de vela en el Puerto Deportivo de Getxo.',
    };
}

export default async function CoursePage({ params: { slug, locale } }: { params: { slug: string; locale: string } }) {
    const supabase = createClient();

    // 1. Fetch Course Data (Server Side)
    // We try to find by slug first
    let { data: course } = await supabase
        .from('cursos')
        .select('*')
        .eq('slug', slug)
        .single();

    // 2. Fetch Active Editions for this course
    let allRealEditions: any[] = [];

    if (course) {
        const { data: editions } = await supabase
            .from('ediciones_curso')
            .select('*')
            .eq('curso_id', course.id)
            .gte('fecha_inicio', new Date().toISOString())
            .order('fecha_inicio', { ascending: true });

        allRealEditions = editions || [];
    }

    // Fallback data for specific critical courses if DB is empty or missing
    interface CourseFallback {
        id: string;
        nombre_es: string;
        nombre_eu: string;
        nombre_en?: string;
        nombre_fr?: string;
        descripcion_es: string;
        descripcion_eu: string;
        descripcion_en?: string;
        descripcion_fr?: string;
        precio: number;
        duracion_h: number;
        nivel: string;
        imagen_url: string;
        detalles: {
            es: string[];
            eu: string[];
        };
    }

    const fallbacks: Record<string, CourseFallback> = {
        'bautismo-vela': {
            id: '550e8400-e29b-41d4-a716-446655440000',
            nombre_es: 'Bautismo de Vela',
            nombre_eu: 'Bela Bataioa',
            descripcion_es: 'Tu primera experiencia en el mar. Aprende las sensaciones básicas de navegar a vela en una sesión de 2 horas.',
            descripcion_eu: 'Zure lehen esperientzia itsasoan. Ikasi bela nabigazioaren oinarrizko sentsazioak 2 orduko saio batean.',
            precio: 35,
            duracion_h: 2,
            nivel: 'iniciacion',
            imagen_url: '/images/courses/BautismodeVela.webp',
            detalles: {
                es: ['Salida de 2 horas', 'Sin experiencia previa', 'Monitor titulado', 'Material incluido'],
                eu: ['2 orduko irteera', 'Esperientziarik gabe', 'Monitore tituluduna', 'Materiala barne']
            }
        },
        'iniciacion-crucero': {
            id: '550e8400-e29b-41d4-a716-446655440001',
            nombre_es: 'Iniciación Crucero',
            nombre_eu: 'Gurutzeontzi Hasiera',
            descripcion_es: 'Curso completo para aprender a gobernar un velero de crucero. Maniobras, seguridad y navegación básica.',
            descripcion_eu: 'Belaontzi bat gobernatzen ikasteko ikastaro osoa. Maniobrak, segurtasuna eta oinarrizko nabigazioa.',
            precio: 250,
            duracion_h: 16,
            nivel: 'iniciacion',
            imagen_url: '/images/courses/IniciacionCrucero.webp',
            detalles: {
                es: ['16 horas prácticas', 'Gobierno del barco', 'Trimado de velas', 'Navegación costera'],
                eu: ['16 ordu praktikoak', 'Ontziaren gobernua', 'Bela trimatua', 'Itsasertzeko nabigazioa']
            }
        },
        'perfeccionamiento-vela': {
            id: '550e8400-e29b-41d4-a716-446655440002',
            nombre_es: 'Perfeccionamiento Vela',
            nombre_eu: 'Bela Hobekuntza',
            descripcion_es: 'Mejora tu técnica, trimado fino y maniobras avanzadas. Para navegantes que ya tienen base.',
            descripcion_eu: 'Hobetu zure teknika, trimatu fina eta maniobra aurreratuak. Oinarria duten nabigatzaileentzat.',
            precio: 290,
            duracion_h: 16,
            nivel: 'perfeccionamiento',
            imagen_url: '/images/courses/PerfeccionamientoVela.webp',
            detalles: {
                es: ['Técnica avanzada', 'Spinnaker / Gennaker', 'Reglaje de velas', 'Navegación con mal tiempo'],
                eu: ['Teknika aurreratua', 'Spinnaker / Gennaker', 'Bela erreglajea', 'Eguraldi txarrarekin nabigazioa']
            }
        },
        'patron-de-yate': {
            id: '550e8400-e29b-41d4-a716-446655440003',
            nombre_es: 'Patrón de Yate',
            nombre_eu: 'Yate Patroia',
            descripcion_es: 'Prácticas oficiales para la obtención del título de Patrón de Yate. Navegación nocturna y travesía.',
            descripcion_eu: 'Yate Patroi titulua lortzeko praktika ofizialak. Gaueko nabigazioa eta zeharkaldia.',
            precio: 450,
            duracion_h: 48,
            nivel: 'titulacion',
            imagen_url: '/images/courses/PatronYate.webp',
            detalles: {
                es: ['48 horas en travesía', 'Navegación nocturna', 'Guardias', 'Planificación de derrota'],
                eu: ['48 ordu zeharkaldian', 'Gaueko nabigazioa', 'Guardiak', 'Derrota planifikazioa']
            }
        },
        'campus-verano': {
            id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
            nombre_es: 'Campus de Verano (Udalekus)',
            nombre_eu: 'Udako Kanpusa (Udalekuak)',
            descripcion_es: 'Campamento de verano para niños y jóvenes de 5 a 21 años empadronados en Getxo.',
            descripcion_eu: '5 eta 21 urte bitarteko haur eta gazteentzako udako campusa, Getxon erroldatuta daudenentzat.',
            precio: 130,
            duracion_h: 20,
            nivel: 'iniciacion',
            imagen_url: '/images/course-raquero-students.webp',
            detalles: {
                es: ['Navegación en grupo', 'Seguridad en el mar', 'Juegos y actividades', '20 horas semanales'],
                eu: ['Taldeko nabigazioa', 'Segurtasuna itsasoan', 'Jolasak eta jarduerak', 'Astean 20 ordu']
            }
        },
        'iniciacion-adultos': {
            id: 'd8db9369-020c-4ffb-9a91-8dec67aacb0c',
            nombre_es: 'Iniciación Adultos',
            nombre_eu: 'Helduentzako Hasiera',
            descripcion_es: 'Curso básico para adultos que quieren empezar en el mundo de la vela.',
            descripcion_eu: 'Helduentzako oinarrizko ikastaroa bela munduan hasteko.',
            precio: 180,
            duracion_h: 12,
            nivel: 'iniciacion',
            imagen_url: '/images/courses/IniciacionJ80.webp',
            detalles: {
                es: ['Fundamentos de vela', 'Maniobras básicas', '12 horas de clase', 'Grupos de adultos'],
                eu: ['Belaren oinarriak', 'Oinarrizko maniobrak', '12 orduko klaseak', 'Helduen taldeak']
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
            imagen_url: '/images/courses/LicenciadeNavegacion.webp',
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
            imagen_url: '/images/courses/CursodeVelaLigera.webp',
            detalles: {
                es: ['Optimist, Laser y 420', 'Octubre a Junio', '3 domingos al mes', 'Incluye monitor y equipo'],
                eu: ['Optimist, Laser eta 420', 'Urritik Ekainera', 'Hilean 3 igande', 'Monitorea eta ekipoa barne']
            }
        }
    };

    const displayCourse = (course || fallbacks[slug]) as any;

    if (!displayCourse) {
        notFound();
    }

    const displayEditions = allRealEditions;

    const t = await getTranslations({ locale, namespace: 'courses' });    // Safe data extraction
    const currentLocale = locale as 'es' | 'eu' | 'en' | 'fr';

    const name = (currentLocale === 'eu' && displayCourse.nombre_eu) ? displayCourse.nombre_eu :
        (currentLocale === 'en' && displayCourse.nombre_es) ? displayCourse.nombre_es :
            (currentLocale === 'fr' && displayCourse.nombre_es) ? displayCourse.nombre_es :
                displayCourse.nombre_es || displayCourse.nombre_es || displayCourse.nombre_eu || 'Course';

    const description = (currentLocale === 'eu' && displayCourse.descripcion_eu) ? displayCourse.descripcion_eu :
        (currentLocale === 'en' && displayCourse.descripcion_es) ? displayCourse.descripcion_es :
            (currentLocale === 'fr' && displayCourse.descripcion_es) ? displayCourse.descripcion_es :
                displayCourse.descripcion_es || 'Course description...';

    // const jsonLd = {
    //     "@context": "https://schema.org",
    //     "@type": "Course",
    //     "name": name,
    //     "description": description,
    //     "provider": {
    //         "@type": "Organization",
    //         "name": "Getxo Bela Eskola",
    //         "sameAs": "https://getxobelaeskola.cloud"
    //     },
    //     "image": displayCourse.imagen_url || 'https://getxobelaeskola.cloud/images/home-hero-sailing-action.webp',
    //     "offers": {
    //         "@type": "Offer",
    //         "price": displayCourse.precio,
    //         "priceCurrency": "EUR",
    //         "availability": "https://schema.org/InStock"
    //     }
    // };

    return (
        <main className="min-h-screen bg-nautical-deep" suppressHydrationWarning>
            {/* <JsonLd data={jsonLd} /> */}
            <div className="fixed inset-0 bg-nautical-deep z-0" />

            <div className="relative z-10 pt-32 pb-24 px-6">
                <div className="container mx-auto">
                    <Link href={`/${locale}/courses`} className="text-sm uppercase tracking-[0.3em] text-accent mb-12 inline-block hover:pl-2 transition-all">
                        ← {t('back_to_catalog')}
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Mobile: booking first (above-the-fold). Desktop: right column via order */}
                        <div className="space-y-12 lg:order-last">
                            <div className="relative h-[300px] md:h-[450px] rounded-sm overflow-hidden border border-white/10 shadow-2xl">
                                <Image
                                    src={displayCourse.imagen_url || '/images/home-hero-sailing-action.webp'}
                                    alt={name}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="card-luxury p-10 bg-white/5 backdrop-blur-xl border border-white/10">
                                <h3 className="font-display text-4xl mb-6 text-sea-foam">Reserva tu plaza</h3>
                                <p className="text-white/60 mb-4">El sistema de reservas no está disponible en este momento.</p>
                                {/* <BookingSelector
                                    editions={displayEditions}
                                    coursePrice={displayCourse.precio}
                                    courseId={displayCourse.id}
                                    activityType={slug.includes('campus') || slug.includes('udalekus') ? 'udalekus' : (slug.includes('vela-ligera') ? 'training' : 'course')}
                                /> */}
                            </div>
                        </div>

                        <div className="space-y-12 lg:order-first">
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
                    </div>
                </div>
            </div>
        </main>
    );
}
