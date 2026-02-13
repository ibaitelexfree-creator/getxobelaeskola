'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AcademyError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // We try to log the error for tracking
    React.useEffect(() => {
        console.error('Academy Error Boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-nautical-black flex flex-col items-center justify-center p-6 text-center" role="alert" aria-live="assertive">
            <div className="relative w-64 h-64 mb-8">
                <div className="absolute inset-0 bg-red-500/10 rounded-full blur-[60px]" />
                <div className="text-9xl relative z-10 animate-float opacity-50 grayscale">
                    ⚓
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-6xl font-black">
                    ✕
                </div>
            </div>

            <h1 className="text-4xl font-display italic text-white mb-4">
                Tormenta inesperada
            </h1>
            <p className="text-white/60 max-w-md mb-8 leading-relaxed">
                Parece que hemos encontrado una anomalía en nuestra carta náutica.
                Nuestros ingenieros han sido notificados.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="px-8 py-4 bg-accent text-nautical-black font-bold uppercase tracking-widest text-sm rounded hover:bg-white transition-colors"
                >
                    Intentar de nuevo
                </button>
                <Link
                    href="/academy"
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-sm rounded hover:bg-white/10 transition-colors"
                >
                    Volver a la Academia
                </Link>
            </div>

            <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-white/20">
                Error ID: {error.digest || 'unknown_nautical_glitch'}
            </p>
        </div>
    );
}
