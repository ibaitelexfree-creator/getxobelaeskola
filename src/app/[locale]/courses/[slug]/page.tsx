import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { listGoogleEvents } from '@/lib/google-calendar';
import { COURSE_FALLBACKS } from '@/data/course-fallbacks';

const BookingSelector = dynamic(() => import('@/components/booking/BookingSelector'), { ssr: false });
import JsonLd from '@/components/shared/JsonLd';

import { Metadata } from 'next';

export async function generateMetadata({
    params: { locale, slug }
}: {
    params: { locale: string; slug: string }
}): Promise<Metadata> {
    const supabase = createClient();
    let course: any = null;
    try {
        const { data } = await supabase
            .from('cursos')
            .select('*')
            .eq('slug', slug)
            .single();
        course = data;
    } catch (e) {
        console.error('Metadata fetch failed:', e);
    }

    const displayCourse = (course || COURSE_FALLBACKS[slug]) as any;
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
    const slugs = [
        'campus-verano-getxo',
        'campus-verano-external',
        'iniciacion-adultos',
        'tecnificacion-adultos',
        'konpondu',
        'windsurf-iniciacion',
        'windsurf-campus'
    ];
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

    const supabase = createClient();

    // 1. Fetch main course data
    let course: any = null;
    try {
        const { data } = await supabase
            .from('cursos')
            .select('*')
            .eq('slug', slug)
            .single();
        course = data;
    } catch (e) {
        console.error('Course fetch failed:', e);
    }

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

    const displayCourse = (course || COURSE_FALLBACKS[slug]) as any;

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
