'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function RegisterPageContent({ locale }: { locale: string }) {
    const t = useTranslations('auth');
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');

    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Form Column - Left on Register for variety */}
            <div className="flex items-center justify-center p-8 pt-48 md:p-24 md:pt-56 lg:pt-24 relative order-2 lg:order-1">
                <div className="bg-mesh opacity-50 absolute inset-0 -z-10" />

                <div className="w-full max-w-md">
                    <header className="mb-12">
                        <h1 className="text-5xl font-display mb-2">{t('register_title')}</h1>
                        <p className="text-foreground/40 font-light">{t('register_desc')}</p>
                    </header>

                    <RegisterForm />

                    <footer className="mt-12 text-center text-[10px] uppercase tracking-widest">
                        <p className="text-foreground/40">
                            {t('has_account')}{' '}
                            <Link href={`/${locale}/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="text-accent hover:text-sea-foam transition-colors font-bold">
                                {t('login_here')}
                            </Link>
                        </p>
                    </footer>
                </div>
            </div>

            {/* Decorative Column */}
            <div className="hidden lg:block relative overflow-hidden bg-nautical-black order-1 lg:order-2">
                <Image
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200"
                    alt="Experiencia de Vela"
                    fill
                    sizes="50vw"
                    className="object-cover grayscale opacity-40 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-nautical-black via-transparent to-transparent" />

                <div className="absolute bottom-20 right-20 z-10 text-right">
                    <h2 className="text-6xl font-display mb-4 italic">{t('hero_text')}</h2>
                    <p className="text-accent uppercase tracking-widest text-[10px] font-bold">Getxo Bela Eskola · Est. 1992</p>
                </div>
            </div>
        </main>
    );
}

export default function RegisterPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-nautical-black" />}>
            <RegisterPageContent locale={locale} />
        </Suspense>
    );
}
