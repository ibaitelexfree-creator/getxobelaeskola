'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('errors.500');
    const locale = useLocale();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Captured by error boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-nautical-black flex items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-xl w-full space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
                    <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-2xl backdrop-blur-sm mx-auto animate-bounce text-red-500">
                        ⚠️
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-red-500 uppercase tracking-[0.4em] text-[10px] font-black opacity-60">
                        {t('code')}
                    </p>
                    <h1 className="text-5xl md:text-7xl font-display italic text-white tracking-tighter">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 font-medium">
                        {t('subtitle')}
                    </p>
                    <p className="text-white/40 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        {t('description')}
                    </p>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center px-8 py-4 bg-accent text-nautical-black border border-accent rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        {t('retry_button')}
                    </button>
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 text-white rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        {t('home_button')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
