'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGamification } from '@/hooks/useGamification';
import BadgeGrid from '@/components/academy/gamification/BadgeGrid';

export default function AchievementsPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('academy');
    const { badges, loading, fetchBadges, unlockBadge } = useGamification();
    const [filter, setFilter] = useState('todos');

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    const categories = ['todos', ...Array.from(new Set(badges.map(l => l.categoria)))];

    const filteredBadges = filter === 'todos'
        ? badges
        : badges.filter(l => l.categoria === filter);

    const totalPuntos = badges.filter(b => b.obtained).reduce((sum, b) => sum + b.puntos, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-nautical-black via-nautical-black to-[#0a1628] text-white pb-20">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <Link href={`/${params.locale}/academy/dashboard`} className="text-accent text-sm hover:underline mb-2 inline-block">
                                ← Volver al Panel
                            </Link>
                            <h1 className="text-4xl font-display italic text-white">Galería de Logros</h1>
                            <p className="text-white/60">Tu historial de hazañas y medallas en el mar.</p>
                        </div>
                        <div className="bg-accent/10 border border-accent/30 rounded-2xl px-6 py-4 text-center">
                            <div className="text-[10px] uppercase tracking-widest text-accent font-black mb-1">Puntos de Prestigio</div>
                            <div className="text-3xl font-display text-white">{totalPuntos}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {/* Demo Button (Hidden in production or used for testing) */}
                <div className="mb-8 p-4 border border-dashed border-white/10 rounded-lg bg-white/5">
                    <p className="text-xs text-white/40 mb-2 uppercase font-bold">Panel de Pruebas (Demo)</p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => unlockBadge('grumete_novato')}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
                        >
                            Desbloquear &quot;Grumete Novato&quot;
                        </button>
                        <button
                            onClick={() => unlockBadge('navegante_nocturno')}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
                        >
                            Desbloquear &quot;Navegante Nocturno&quot;
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === cat
                                ? 'bg-accent text-nautical-black'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid de Logros */}
                <BadgeGrid badges={filteredBadges} loading={loading} locale={params.locale} />
            </div>
        </div>
    );
}
