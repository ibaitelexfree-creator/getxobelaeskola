'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Anchor } from 'lucide-react';
import { TIDES_LESSON_DATA } from '@/lib/academy/tides-data';
import TidesLessonViewer from '@/components/academy/interactive/TidesLessonViewer';

export default function TidesLessonPage() {
    return (
        <div className="min-h-screen bg-nautical-black text-white pb-20">
            {/* Header */}
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-md pt-24 pb-12">
                <div className="container mx-auto px-6">
                    <Link
                        href="/es/academy"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver a la Academia
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
                            <Anchor className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display italic text-white">
                            Lección de <span className="text-accent">Mareas</span>
                        </h1>
                    </div>
                    <p className="text-lg text-white/60 max-w-2xl font-light leading-relaxed">
                        {TIDES_LESSON_DATA.description}
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                 <TidesLessonViewer lesson={TIDES_LESSON_DATA} />
            </main>
        </div>
    );
}
