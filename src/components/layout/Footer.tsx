import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import Newsletter from '@/components/shared/Newsletter';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function Footer({ locale }: { locale: string }) {
    const t = await getTranslations({ locale, namespace: 'footer' });
    const supabase = createClient();

    // Check if we should hide the newsletter
    const { data: { user } } = await supabase.auth.getUser();
    let isSubscribed = false;

    if (user?.email) {
        const supabaseAdmin = createAdminClient();
        const { data: sub } = await supabaseAdmin
            .from('newsletter_subscriptions')
            .select('active')
            .eq('email', user.email)
            .eq('active', true)
            .maybeSingle();

        if (sub) isSubscribed = true;
    }

    return (
        <footer className="bg-nautical-deep border-t border-white/5 selection:bg-accent selection:text-nautical-black relative">
            <div className="absolute inset-0 bg-maps opacity-10 pointer-events-none" />
            {!isSubscribed && <Newsletter locale={locale} />}

            <div className="py-24 container mx-auto px-6 flex flex-col items-center">
                <div className="flex flex-col items-center gap-6 mb-12 group">
                    <div className="relative w-32 h-32 transition-transform duration-700 group-hover:scale-110">
                        <Image
                            src="/images/LogoGetxoBelaEskola.png"
                            alt="Getxo Bela Eskola"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="font-display text-5xl text-white flex items-center gap-6 tracking-tight">
                        <span className="w-12 h-px bg-accent/20" />
                        GETXO <span className="italic font-light text-accent">BELA</span> ESKOLA
                        <span className="w-12 h-px bg-accent/20" />
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm uppercase tracking-[0.3em] font-bold text-foreground/60 mb-12">
                    <Link href={`/${locale}/courses`} className="hover:text-accent transition-colors duration-500">
                        {t('courses')}
                    </Link>
                    <Link href={`/${locale}/rental`} className="hover:text-accent transition-colors duration-500">
                        {t('rental')}
                    </Link>
                    <Link href={`/${locale}/about`} className="hover:text-accent transition-colors duration-500">
                        {t('school')}
                    </Link>
                    <Link href={`/${locale}/contact`} className="hover:text-accent transition-colors duration-500">
                        {t('contact')}
                    </Link>
                </div>

                <div className="w-12 h-px bg-white/5 mb-12" />

                <div className="text-sm uppercase tracking-[0.2em] text-foreground/60 font-medium text-center max-w-xl leading-loose">
                    {t('copyright')}
                    <br />
                    <span className="mt-4 block hover:text-white/60 transition-colors cursor-default">
                        Getxo Bela Eskola — Experiencia náutica por excelencia en el Puerto Deportivo de Getxo.
                    </span>
                </div>
            </div>
        </footer>
    );
}
