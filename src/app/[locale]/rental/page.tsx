import React from 'react';
import { createClient } from '@/lib/supabase/server';
import RentalClient from '@/components/rental/RentalClient';
import { getTranslations } from 'next-intl/server';

export default async function RentalPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'rental_page' });
    const supabase = createClient();
    let services = [];

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

            services = (data || []).sort((a, b) => {
                const indexA = priorityOrder.indexOf(a.slug);
                const indexB = priorityOrder.indexOf(b.slug);

                // If slug not in list, put at the end
                const posA = indexA === -1 ? 999 : indexA;
                const posB = indexB === -1 ? 999 : indexB;

                return posA - posB;
            });
        }
    } catch (err) {
        console.error('Network error fetching services:', err);
    }

    return (
        <main className="min-h-screen bg-nautical-black text-white selection:bg-accent selection:text-nautical-black">
            {/* Cinematic Header Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                {/* Background Decor */}
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

            {/* Main Interactive Fleet Section */}
            <section className="pb-48 relative">
                <div className="container mx-auto px-6 relative z-10">
                    <RentalClient services={services || []} locale={locale} />
                </div>

                {/* Bottom Note / Disclosure */}
                <div className="container mx-auto px-6 mt-32">
                    <div className="relative group p-12 md:p-16 border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-700" />
                        <p className="text-foreground/40 font-light italic text-lg leading-relaxed max-w-4xl">
                            {t('footer_note')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Minimal Background Grid Signature */}
            <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none z-0" />
        </main>
    );
}
