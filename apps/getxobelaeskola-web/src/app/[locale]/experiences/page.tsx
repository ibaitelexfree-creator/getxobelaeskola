import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import ExperiencesClient from '@/components/experiences/ExperiencesClient';
import ExperienceDisclaimerCard from '@/components/shared/ExperienceDisclaimerCard';
import { getSeoAlternates, siteUrl } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'experiences_page' });

    const title = `${t('title_prefix')} ${t('title_highlight')} | Getxo Bela Eskola`;
    const description = t('description');

    return {
        title,
        description,
        alternates: getSeoAlternates('experiences', locale),
        openGraph: {
            title,
            description,
            url: `${siteUrl}/${locale}/experiences`,
            images: [
                {
                    url: '/images/home-hero-sailing-action.webp',
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/images/home-hero-sailing-action.webp'],
        }
    };
}

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default async function ExperiencesPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'experiences_page' });
    const supabase = createClient();
    let experiences: any[] = [];
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

    try {
        // Try to fetch from experiencias table
        const { data, error } = await supabase
            .from('experiencias')
            .select('*')
            .eq('activo', true)
            .order('precio', { ascending: true })
            .limit(50); // Performance: cap results

        if (error) {
            console.error('Error fetching experiences:', error.message);
            // Fallback: fetch from servicios_alquiler with category eventos
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('servicios_alquiler')
                .select('*')
                .eq('activo', true)
                .in('categoria', ['eventos', 'cumpleanos', 'bono', 'atraque'])
                .limit(50);

            if (fallbackError) {
                console.error('Fallback error:', fallbackError.message);
            } else {
                experiences = (fallbackData || []).map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    nombre_eu: item.nombre_eu || item.nombre,
                    nombre_en: item.nombre_en || item.nombre,
                    nombre_fr: item.nombre_fr || item.nombre,
                    slug: item.slug,
                    descripcion: item.descripcion,
                    descripcion_eu: item.descripcion_eu || item.descripcion,
                    descripcion_en: item.descripcion_en || item.descripcion,
                    descripcion_fr: item.descripcion_fr || item.descripcion,
                    categoria: item.categoria || 'evento',
                    precio: item.precio_base || item.precio_hora,
                    imagen_url: (item.slug === 'bono-navegacion' || item.slug === 'navigation-voucher' || item.nombre?.toLowerCase().includes('bono navegacion') || item.nombre?.toLowerCase().includes('navigation voucher') || item.nombre_en?.toLowerCase().includes('navigation voucher'))
                        ? '/images/experiences/navigation-voucher.jpg'
                        : (item.slug === 'bono-windsurf-5' || item.slug === 'windsurf-voucher' || item.nombre?.toLowerCase().includes('bono windsurf') || item.nombre?.toLowerCase().includes('windsurf voucher') || item.nombre_en?.toLowerCase().includes('windsurf voucher'))
                        ? '/images/experiences/windsurf-voucher.jpg'
                        : (item.slug === 'sailboat-mooring' || item.nombre?.toLowerCase().includes('sailboat mooring') || item.nombre_en?.toLowerCase().includes('sailboat mooring'))
                        ? '/images/experiences/sailboat-mooring.jpg'
                        : (item.slug?.includes('canoe') || item.slug?.includes('atraque') || item.nombre?.toLowerCase().includes('canoe') || item.nombre?.toLowerCase().includes('piragua') || item.nombre?.toLowerCase().includes('atraque'))
                        ? '/images/about-patio.jpg'
                        : item.imagen_url || (item.slug?.includes('cumplean') || item.nombre?.toLowerCase().includes('cumplea') ? '/images/IMG_20241016_114549.jpg' : '/images/home-hero-sailing-action.webp'),
                    duracion: item.duracion_minutos ? `${item.duracion_minutos} min` : null,
                    activo: true,
                }));
            }
        } else {
            experiences = (data || []).map(item => ({
                id: item.id,
                nombre: item.nombre_es,
                nombre_eu: item.nombre_eu || item.nombre_es,
                nombre_en: item.nombre_en || item.nombre_es,
                nombre_fr: item.nombre_fr || item.nombre_es,
                slug: item.slug,
                descripcion: item.descripcion_es,
                descripcion_eu: item.descripcion_eu || item.descripcion_es,
                descripcion_en: item.descripcion_en || item.descripcion_es,
                descripcion_fr: item.descripcion_fr || item.descripcion_es,
                categoria: item.tipo || 'evento',
                precio: item.precio,
                imagen_url: item.slug === 'cumpleanos-navegacion'
                    ? '/images/IMG_20241016_114549.jpg'
                    : (item.slug === 'cumpleanos-bigsub' || item.nombre_es?.toLowerCase().includes('bigsup') || item.nombre_en?.toLowerCase().includes('bigsup'))
                    ? '/images/experiences/birthday-bigsub.jpg'
                    : (item.slug?.includes('space') || item.nombre_es?.toLowerCase().includes('espacio') || item.nombre_en?.toLowerCase().includes('space') || item.nombre_es?.toLowerCase().includes('rental'))
                    ? '/images/experiences/birthday-space-rental.jpg'
                    : (item.slug === 'bono-navegacion' || item.slug === 'navigation-voucher' || item.nombre_es?.toLowerCase().includes('bono navegación') || item.nombre_es?.toLowerCase().includes('bono navegacion') || item.nombre_en?.toLowerCase().includes('navigation voucher'))
                    ? '/images/experiences/navigation-voucher.jpg'
                    : (item.slug === 'bono-windsurf-5' || item.slug === 'windsurf-voucher' || item.nombre_es?.toLowerCase().includes('bono windsurf') || item.nombre_en?.toLowerCase().includes('windsurf voucher') || item.nombre_es?.toLowerCase().includes('windsurf voucher'))
                    ? '/images/experiences/windsurf-voucher.jpg'
                    : (item.slug === 'atraque-windsurf' || item.nombre_es?.toLowerCase().includes('atraque windsurf') || item.nombre_en?.toLowerCase().includes('windsurf mooring'))
                    ? '/images/experiences/windsurf-mooring.jpg'
                    : (item.slug === 'sailboat-mooring' || item.slug?.includes('sailboat') || item.nombre_es?.toLowerCase().includes('velero') || item.nombre_es?.toLowerCase().includes('sailboat') || item.nombre_en?.toLowerCase().includes('sailboat'))
                    ? '/images/experiences/sailboat-mooring.jpg'
                    : (item.slug?.includes('canoe') || item.slug?.includes('atraque') || item.nombre_es?.toLowerCase().includes('canoe') || item.nombre_es?.toLowerCase().includes('piragua') || item.nombre_es?.toLowerCase().includes('atraque'))
                    ? '/images/about-patio.jpg'
                    : (item.imagen_url || '/images/home-hero-sailing-action.webp'),
                duracion: item.duracion_h ? `${item.duracion_h}h` : null,
                min_participantes: item.min_participantes || item.edad_minima, // Fallback to age or pax if needed
                activo: true,
            }));
        }
    } catch (err) {
        console.error('Network error fetching experiences:', err);
    }

    // Structured Data (JSON-LD)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': `${t('title_prefix')} ${t('title_highlight')}`,
        'description': t('description'),
        'numberOfItems': experiences.length,
        'itemListElement': experiences.map((exp, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'item': {
                '@type': 'Product',
                'name': locale === 'eu' ? (exp.nombre_eu || exp.nombre) : locale === 'en' ? (exp.nombre_en || exp.nombre) : locale === 'fr' ? (exp.nombre_fr || exp.nombre) : exp.nombre,
                'description': locale === 'eu' ? (exp.descripcion_eu || exp.descripcion) : locale === 'en' ? (exp.descripcion_en || exp.descripcion) : locale === 'fr' ? (exp.descripcion_fr || exp.descripcion) : exp.descripcion,
                'image': `${siteUrl}${exp.imagen_url || '/images/home-hero-sailing-action.webp'}`,
                'offers': {
                    '@type': 'Offer',
                    'price': exp.precio,
                    'priceCurrency': 'EUR',
                    'availability': 'https://schema.org/InStock',
                    'url': `${siteUrl}/${locale}/contact`
                }
            }
        }))
    };

    return (
        <main className="min-h-[100dvh] w-full bg-nautical-black text-sea-foam selection:bg-accent selection:text-nautical-black overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Cinematic Header */}
            <section className="relative pt-16 min-[480px]:pt-20 sm:pt-28 md:pt-36 pb-3 min-[480px]:pb-4 sm:pb-8 overflow-hidden w-full">
                <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-accent/5 blur-[80px] sm:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-[20%] left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-brass-gold/5 blur-[60px] sm:blur-[100px] rounded-full -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto px-3 sm:px-6 relative z-10">
                    <header className="max-w-4xl">
                        <span className="text-accent uppercase tracking-[0.2em] sm:tracking-[0.6em] text-[10px] sm:text-sm font-bold mb-1.5 sm:mb-4 block animate-fade-in-up">
                            {t('header_eyebrow')}
                        </span>
                        <h1 className="text-2xl min-[480px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display leading-[1] sm:leading-[0.95] text-sea-foam mb-2 sm:mb-6 animate-reveal relative z-20 break-words">
                            {t('title_prefix')}{' '}
                            <span className="italic font-light text-brass-gold/90 drop-shadow-sm">{t('title_highlight')}</span>
                        </h1>
                        <p className="max-w-2xl text-sea-foam/60 font-light text-xs min-[480px]:text-sm sm:text-base md:text-lg leading-relaxed border-l border-sea-foam/10 pl-3 sm:pl-6 md:pl-8 mt-2 sm:mt-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                            {t('description')}
                        </p>
                    </header>
                </div>
            </section>

            {/* Experiences Grid */}
            <section className="pb-12 sm:pb-32 md:pb-48 relative">
                <div className="container mx-auto px-3 sm:px-6 relative z-10">
                    <ExperiencesClient experiences={experiences} locale={locale} />
                </div>

                {/* Bottom Note */}
                <div className="container mx-auto px-4 sm:px-6 mt-16 sm:mt-24 md:mt-32">
                    <ExperienceDisclaimerCard noteText={t('footer_note')} locale={locale} />
                </div>
            </section>

            <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none z-0" />
        </main>
    );
}

