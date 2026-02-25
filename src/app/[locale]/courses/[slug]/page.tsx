import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import BookingSelector from '@/components/booking/BookingSelector';
import JsonLd from '@/components/shared/JsonLd';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function generateMetadata({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
    const t = await getTranslations({ locale, namespace: 'courses' });
    const dict = await getTranslations({ locale, namespace: 'course_names' });

    const title = dict.has(slug) ? dict(slug) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
        title: `${title} | Getxo Bela Eskola`,
        description: t('meta_description', { course: title }),
        alternates: {
            canonical: `https://getxobelaeskola.cloud/${locale}/courses/${slug}`,
            languages: {
                'es': `https://getxobelaeskola.cloud/es/courses/${slug}`,
                'eu': `https://getxobelaeskola.cloud/eu/courses/${slug}`,
                'fr': `https://getxobelaeskola.cloud/fr/courses/${slug}`,
                'en': `https://getxobelaeskola.cloud/en/courses/${slug}`
            }
        }
    };
}

// Revalidate every hour to keep availability fresh
export const revalidate = 3600;

export default async function CoursePage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
    const supabase = createClient();

    // 1. Fetch course details and available editions
    // Using a more robust query to get active editions
    const { data: course, error: courseError } = await supabase
        .from('cursos')
        .select(`
            *,
            ediciones_curso (
                id,
                fecha_inicio,
                fecha_fin,
                plazas_totales,
                plazas_ocupadas
            )
        `)
        .eq('slug', slug)
        .single();

    // Check if course exists in DB, otherwise check fallbacks (for static pages)
    // Filter editions to show only future ones with space
    const now = new Date().toISOString();
    const allRealEditions = course?.ediciones_curso
        ?.filter((e: any) => e.fecha_inicio > now && e.plazas_ocupadas < e.plazas_totales)
        .sort((a: any, b: any) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()) || [];

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
        detalles?: {
            es: string[];
            eu: string[];
        };
    }

    const fallbacks: Record<string, CourseFallback> = {
        'bautismo-vela': {
            id: '7b3c2941-8f81-4475-b6d8-6597793d2562',
            nombre_es: 'Bautismo de Vela',
            nombre_eu: 'Bela Bataioa',
            descripcion_es: 'Tu primera experiencia en el mar. Aprende las nociones básicas y siente el viento en las velas en una salida de 3 horas.',
            descripcion_eu: 'Zure lehen esperientzia itsasoan. Ikasi oinarrizko nozioak eta sentitu haizea beletan 3 orduko irteera batean.',
            precio: 50,
            duracion_h: 3,
            nivel: 'bautismo',
            imagen_url: '/images/courses/BautismodeVela.webp',
            detalles: {
                es: ['Salida de 3 horas', 'Instructor titulado', 'Material de seguridad incluido', 'Sin experiencia previa'],
                eu: ['3 orduko irteera', 'Monitore tituluduna', 'Segurtasun materiala barne', 'Esperientziarik gabe']
            }
        },
        'per': {
            id: '96b12d88-5101-4456-a18a-44677708573f',
            nombre_es: 'Patrón de Embarcaciones de Recreo (PER)',
            nombre_eu: 'Aisialdiko Ontzietako Patroia (PER)',
            descripcion_es: 'El título rey de la náutica. Gobierna barcos de hasta 15 metros y navega hasta 12 millas de la costa.',
            descripcion_eu: 'Nautikako titulu nagusia. 15 metrorainoko ontziak gobernatu eta kostaldetik 12 miliara nabigatu.',
            precio: 450,
            duracion_h: 40,
            nivel: 'titulo',
            imagen_url: '/images/courses/PER.webp',
            detalles: {
                es: ['Teoría y Práctica', 'Radio Operador', 'Vela (Opcional)', 'Hasta 15 metros'],
                eu: ['Teoria eta Praktika', 'Irrati Operadorea', 'Bela (Aukerakoa)', '15 metroraino']
            }
        },
        'pnb': {
            id: '1e523315-7798-444a-950c-396434444585',
            nombre_es: 'Patrón de Navegación Básica (PNB)',
            nombre_eu: 'Oinarrizko Nabigazio Patroia (PNB)',
            descripcion_es: 'Iníciate en el gobierno de embarcaciones. Hasta 8 metros de eslora y 5 millas de la costa.',
            descripcion_eu: 'Hasi ontzien gobernuan. 8 metroko luzera eta kostaldetik 5 miliara.',
            precio: 350,
            duracion_h: 20,
            nivel: 'titulo',
            imagen_url: '/images/courses/PNB.webp',
            detalles: {
                es: ['Teoría simplificada', 'Prácticas de seguridad', 'Hasta 8 metros', 'Navegación nocturna'],
                eu: ['Teoria sinplifikatua', 'Segurtasun praktikak', '8 metroraino', 'Gaueko nabigazioa']
            }
        },
        'campus-verano': {
            id: 'd9b9a671-5573-455b-8668-333555776655',
            nombre_es: 'Campus de Verano (Udalekus)',
            nombre_eu: 'Udako Kanpusa (Udalekuak)',
            descripcion_es: '¡El mejor plan para el verano! Vela, juegos, amigos y mucha diversión para niños y jóvenes de 7 a 16 años.',
            descripcion_eu: 'Udako plan onena! Bela, jolasak, lagunak eta dibertsio handia 7 eta 16 urte bitarteko haur eta gazteentzat.',
            precio: 195,
            duracion_h: 20,
            nivel: 'udaleku',
            imagen_url: '/images/courses/Udalekus.webp',
            detalles: {
                es: ['Navegación en equipo', 'Seguridad en el mar', 'Juegos y actividades', '20 horas semanales'],
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

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": name,
        "description": description,
        "provider": {
            "@type": "Organization",
            "name": "Getxo Bela Eskola",
            "sameAs": "https://getxobelaeskola.cloud"
        },
        "image": displayCourse.imagen_url || 'https://getxobelaeskola.cloud/images/home-hero-sailing-action.webp',
        "offers": {
            "@type": "Offer",
            "price": displayCourse.precio,
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock"
        }
    };

    return (
        <main className="min-h-screen bg-nautical-deep" suppressHydrationWarning>
            <JsonLd data={jsonLd} />
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
                                <BookingSelector
                                    editions={displayEditions}
                                    coursePrice={displayCourse.precio}
                                    courseId={displayCourse.id}
                                    activityType={slug.includes('campus') || slug.includes('udalekus') ? 'udalekus' : (slug.includes('vela-ligera') ? 'training' : 'course')}
                                />
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
