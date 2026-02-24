'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ManeuverPlayer from '@/components/academy/navigation/ManeuverPlayer';

export default function ManeuversPage({ params }: { params: { locale: string } }) {
    return (
        <div className="min-h-screen bg-[#000510] text-white">
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-md pt-24 pb-12">
                <div className="container mx-auto px-6">
                    <Link
                        href={`/${params.locale}/academy`}
                        className="inline-flex items-center gap-2 text-white/40 hover:text-[#fbbf24] transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver a la Academia
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold italic text-white mb-4">
                        Simulador de <span className="text-[#fbbf24]">Maniobras</span>
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl font-light">
                        Visualiza y comprende paso a paso las maniobras fundamentales de la navegación a vela.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 flex justify-center">
                <ManeuverPlayer className="w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10" />
            </main>
        </div>
    );
}
