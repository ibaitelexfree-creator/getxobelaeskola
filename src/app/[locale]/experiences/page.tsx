import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import ExperiencesClient from '@/components/experiences/ExperiencesClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'experiences_page' });
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

    const title = `${t('title_prefix')} ${t('title_highlight')} | Getxo Bela Eskola`;
    const description = t('description');

    return {
        title,
        description,
        alternates: {
            canonical: `${siteUrl}/${locale}/experiences`,
            languages: {
                'es': `${siteUrl}/es/experiences`,
                'eu': `${siteUrl}/eu/experiences`,
                'en': `${siteUrl}/en/experiences`,
            }
        },
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
    return ['es', 'eu', 'en'].map(locale => ({ locale }));
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
                    slug: item.slug,
                    descripcion: item.descripcion,
                    descripcion_eu: item.descripcion_eu || item.descripcion,
                    descripcion_en: item.descripcion_en || item.descripcion,
                    categoria: item.categoria || 'evento',
                    precio: item.precio_base || item.precio_hora,
                    imagen_url: item.imagen_url || '/images/home-hero-sailing-action.webp',
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
                slug: item.slug,
                descripcion: item.descripcion_es,
                descripcion_eu: item.descripcion_eu || item.descripcion_es,
                descripcion_en: item.descripcion_en || item.descripcion_es,
                categoria: item.tipo || 'evento',
                precio: item.precio,
                imagen_url: item.imagen_url || '/images/home-hero-sailing-action.webp',
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
                'name': locale === 'eu' ? (exp.nombre_eu || exp.nombre) : locale === 'en' ? (exp.nombre_en || exp.nombre) : exp.nombre,
                'description': locale === 'eu' ? (exp.descripcion_eu || exp.descripcion) : locale === 'en' ? (exp.descripcion_en || exp.descripcion) : exp.descripcion,
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
        <main className="min-h-screen bg-nautical-black text-white selection:bg-accent selection:text-nautical-black">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Cinematic Header */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-brass-gold/5 blur-[100px] rounded-full -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <header className="max-w-4xl">
                        <span className="text-accent uppercase tracking-[0.6em] text-sm font-bold mb-8 block animate-fade-in-up">
                            {t('header_eyebrow')}
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-display leading-[0.9] text-white mb-12 animate-reveal relative z-20">
                            {t('title_prefix')} <br />
                            <span className="italic font-light text-brass-gold/90 drop-shadow-sm">{t('title_highlight')}</span>
                        </h1>
                        <p className="max-w-2xl text-foreground/40 font-light text-xl leading-relaxed border-l border-white/10 pl-12 mt-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                            {t('description')}
                        </p>
                    </header>
                </div>
            </section>

            {/* Experiences Grid */}
            <section className="pb-48 relative">
                <div className="container mx-auto px-6 relative z-10">
                    <ExperiencesClient experiences={experiences} locale={locale} />
                </div>

                {/* Bottom Note */}
                <div className="container mx-auto px-6 mt-32">
                    <div className="relative group p-12 md:p-16 border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-700" />
                        <p className="text-foreground/40 font-light italic text-lg leading-relaxed max-w-4xl">
                            {t('footer_note')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none z-0" />
        </main>
    );
}

