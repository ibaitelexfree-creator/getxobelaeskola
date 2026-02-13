'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('errors.404');
    const locale = useLocale();

    return (
        <div className="min-h-screen bg-nautical-black flex items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-xl w-full space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* 3D Icon or Large Emoji */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full" />
                    <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-2xl backdrop-blur-sm mx-auto animate-bounce">
                        ⚓
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-accent uppercase tracking-[0.4em] text-[10px] font-black opacity-60">
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

                <div className="pt-8">
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all active:scale-95 group"
                    >
                        <span className="mr-3 group-hover:-translate-x-1 transition-transform">←</span>
                        {t('back_button')}
                    </Link>
                </div>

                {/* Aesthetic Nautical Coordinates (Random/Mock) */}
                <div className="pt-12 flex items-center justify-center gap-6 opacity-20">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/30" />
                    <span className="text-[10px] font-mono whitespace-nowrap">
                        43.3444° N, 3.0125° W • GETXO RADAR
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/30" />
                </div>
            </div>
        </div>
    );
}
