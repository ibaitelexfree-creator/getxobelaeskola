import React from 'react';
import { createClient } from '@/lib/supabase/server';
import RentalClient from '@/components/rental/RentalClient';
import ExperienceDisclaimerCard from '@/components/shared/ExperienceDisclaimerCard';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getSeoAlternates, siteUrl } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'rental_page' });

    const title = `${t('title_prefix')} ${t('title_highlight')} | Getxo Bela Eskola`;
    const description = t('description');

    return {
        title,
        description,
        alternates: getSeoAlternates('rental', locale),
        openGraph: {
            title,
            description,
            url: `${siteUrl}/${locale}/rental`,
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

interface Service {
    id: string;
    slug: string;
    nombre: string;
    nombre_es?: string;
    nombre_eu?: string;
    nombre_en?: string;
    descripcion: string;
    descripcion_es?: string;
    descripcion_eu?: string;
    descripcion_en?: string;
    imagen_url: string;
    precio_base: number;
    precio_hora?: number;
    activo: boolean;
    categoria?: string;
    opciones?: any[];
}

export default async function RentalPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'rental_page' });
    const tData = await getTranslations({ locale, namespace: 'rentals_data' });
    const supabase = createClient();
    let services: Service[] = [];
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

    try {
        const { data, error } = await supabase
            .from('servicios_alquiler')
            .select('*')
            .eq('activo', true)
            .order('precio_base', { ascending: true });

        if (error) {
            console.error('Error fetching rental services:', error);
        } else {
            const priorityOrder = [
                'alquiler-kayak-1',
                'alquiler-kayak-2',
                'alquiler-paddlesurf',
                'alquiler-piragua-1',
                'alquiler-piragua-2',
                'alquiler-windsurf',
                'alquiler-optimist',
                'alquiler-laser',
                'alquiler-j80',
                'alquiler-raquero'
            ];

            // Type assertion here because Supabase response might not perfectly match our strict interface
            services = ((data as unknown as Service[]) || []).sort((a, b) => {
                const indexA = priorityOrder.indexOf(a.slug);
                const indexB = priorityOrder.indexOf(b.slug);

                const posA = indexA === -1 ? 999 : indexA;
                const posB = indexB === -1 ? 999 : indexB;

                return posA - posB;
            });
        }

        if (!services || services.length === 0) {
            services = [
                { id: '1', slug: 'alquiler-kayak-1', nombre: 'Kayak (1 Persona)', nombre_es: 'Kayak (1 Persona)', nombre_eu: 'Kayaka (Pertsona 1)', descripcion: 'Kayak individual', imagen_url: '/images/kayak-1-person.webp', precio_base: 15, activo: true, categoria: 'kayak' },
                { id: '2', slug: 'alquiler-kayak-2', nombre: 'Kayak (2 Personas)', nombre_es: 'Kayak (2 Personas)', nombre_eu: 'Kayaka (2 Pertsona)', descripcion: 'Kayak doble', imagen_url: '/images/kayak-1-person.webp', precio_base: 25, activo: true, categoria: 'kayak' },
                { id: '3', slug: 'alquiler-paddlesurf', nombre: 'Paddle Surf', nombre_es: 'Paddle Surf', nombre_eu: 'Paddle Surf', descripcion: 'Tabla de Stand Up Paddle', imagen_url: '/images/paddle-surf.webp', precio_base: 15, activo: true, categoria: 'paddlesurf' },
                { id: '4', slug: 'alquiler-piragua-1', nombre: 'Piragua (1 Persona)', nombre_es: 'Piragua (1 Persona)', nombre_eu: 'Piragua (Pertsona 1)', descripcion: 'Piragua individual', imagen_url: '/images/kayak-1-person.webp', precio_base: 15, activo: true, categoria: 'piragua' },
                { id: '5', slug: 'alquiler-piragua-2', nombre: 'Piragua (2 Personas)', nombre_es: 'Piragua (2 Personas)', nombre_eu: 'Piragua (2 Pertsona)', descripcion: 'Piragua doble', imagen_url: '/images/kayak-1-person.webp', precio_base: 25, activo: true, categoria: 'piragua' },
                { id: '6', slug: 'alquiler-windsurf', nombre: 'Windsurf', nombre_es: 'Windsurf', nombre_eu: 'Windsurf', descripcion: 'Equipo de Windsurf', imagen_url: '/images/courses/PerfeccionamientoVela.webp', precio_base: 30, activo: true, categoria: 'windsurf' },
                { id: '7', slug: 'alquiler-optimist', nombre: 'Optimist', nombre_es: 'Optimist', nombre_eu: 'Optimist', descripcion: 'Vela ligera infantil', imagen_url: '/images/rental-optimist.webp', precio_base: 20, activo: true, categoria: 'veleros' },
                { id: '11', slug: 'alquiler-420', nombre: '420 (Double)', nombre_es: '420 (Double)', nombre_eu: '420 (Bikoitza)', descripcion: 'Embarcación de vela ligera tipo 420', imagen_url: '/images/420.jpg', precio_base: 45, activo: true, categoria: 'veleros' },
                { id: '18', slug: 'atraque-velero', nombre: 'Atraque Velero', nombre_es: 'Atraque Velero', nombre_eu: 'Belontzi Atrakatzea', descripcion: 'Servicio de atraque mensual para velero', imagen_url: '/images/atraque-velero.webp', precio_base: 50, activo: true, categoria: 'atraques' },
                { id: '9', slug: 'alquiler-j80', nombre: 'Veleros J80', nombre_es: 'Veleros J80', nombre_eu: 'J80 Belaontziak', descripcion: 'Crucero J80', imagen_url: '/images/J80.jpg', precio_base: 60, activo: true, categoria: 'veleros' },
                { id: '10', slug: 'alquiler-raquero', nombre: 'Raquero / Omega', nombre_es: 'Raquero / Omega', nombre_eu: 'Raquero / Omega', descripcion: 'Vela ligera colectiva', imagen_url: '/images/alquiler-raquero.jpg', precio_base: 50, activo: true, categoria: 'veleros' }
            ];
        }
    } catch (err) {
        console.error('Network error fetching services:', err);
    }

    // Structured Data (JSON-LD)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': `${t('title_prefix')} ${t('title_highlight')}`,
        'description': t('description'),
        'numberOfItems': services.length,
        'itemListElement': services.map((service, index) => {
            const hasTranslation = tData.has(service.slug);
            const serviceName = hasTranslation
                ? tData(service.slug)
                : (locale === 'es' ? service.nombre_es : (locale === 'eu' ? service.nombre_eu : service.nombre_es)) || service.nombre;
            return {
                '@type': 'ListItem',
                'position': index + 1,
                'item': {
                    '@type': 'Product',
                    'name': serviceName,
                    'description': locale === 'eu' ? (service.descripcion_eu || service.descripcion) : service.descripcion,
                    'image': `${siteUrl}${service.imagen_url || '/images/home-hero-sailing-action.webp'}`,
                    'offers': {
                        '@type': 'Offer',
                        'price': service.precio_base || service.precio_hora,
                        'priceCurrency': 'EUR',
                        'availability': 'https://schema.org/InStock',
                        'url': `${siteUrl}/${locale}/rental`
                    }
                }
            };
        })
    };

    return (
        <main className="min-h-[100dvh] w-full bg-nautical-black text-sea-foam selection:bg-accent selection:text-nautical-black">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Cinematic Header Section */}
            <section className="relative pt-16 min-[480px]:pt-20 sm:pt-24 md:pt-32 landscape:pt-16 pb-4 min-[480px]:pb-6 sm:pb-10 md:pb-14 landscape:pb-4 overflow-hidden w-full">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-brass-gold/5 blur-[100px] rounded-full -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto px-3 sm:px-6 relative z-10">
                    <header className="max-w-4xl">
                        <span className="text-accent uppercase tracking-[0.2em] sm:tracking-[0.4em] md:tracking-[0.6em] text-[10px] sm:text-xs md:text-sm font-bold mb-1.5 sm:mb-4 landscape:mb-2 block animate-fade-in-up">
                            {t('header_eyebrow')}
                        </span>
                        <h1 className="text-[clamp(1.5rem,5vw,5rem)] font-display leading-[1.05] text-sea-foam mb-2 sm:mb-6 md:mb-8 landscape:mb-4 animate-reveal relative z-20 whitespace-normal">
                            <span>{t('title_prefix')}</span>{' '}
                            <span className="italic font-light text-brass-gold/90 drop-shadow-sm">{t('title_highlight')}</span>
                        </h1>
                        <p className="max-w-2xl text-sea-foam/70 font-light text-xs sm:text-base md:text-lg leading-relaxed border-l-2 border-sea-foam/10 pl-3 sm:pl-6 md:pl-8 mt-2 sm:mt-6 landscape:mt-3 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                            {t('description')}
                        </p>
                    </header>
                </div>
            </section>

            {/* Main Interactive Fleet Section */}
            <section className="pb-8 sm:pb-16 md:pb-24 landscape:pb-12 relative">
                <div className="container mx-auto px-3 sm:px-6 relative z-10">
                    <RentalClient services={(services as any[]) || []} locale={locale} />
                </div>

                {/* Bottom Note / Disclosure */}
                <div className="container mx-auto px-4 sm:px-6 mt-8 sm:mt-16 md:mt-20 landscape:mt-8">
                    <ExperienceDisclaimerCard noteText={t('footer_note')} locale={locale} />
                </div>
            </section>

            {/* Minimal Background Grid Signature */}
            <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none z-0" />
        </main>
    );
}
