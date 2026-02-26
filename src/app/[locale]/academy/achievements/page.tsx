<<<<<<< HEAD
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGamification } from '@/hooks/useGamification';
import BadgeGrid from '@/components/academy/gamification/BadgeGrid';

export default function AchievementsPage({ params }: { params: { locale: string } }) {

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
=======
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';

interface Logro {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    icono: string;
    puntos: number;
    rareza: 'comun' | 'raro' | 'epico' | 'legendario';
    categoria: string;
}

interface LogroAlumno {
    logro_id: string;
    fecha_obtenido: string;
    logro: Logro;
}

export default function AchievementsPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('academy');
    const [allLogros, setAllLogros] = useState<Logro[]>([]);
    const [userLogros, setUserLogros] = useState<Record<string, LogroAlumno>>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(apiUrl('/api/academy/achievements'));
                const data = await res.json();

                if (data.catálogo) {
                    setAllLogros(data.catálogo);
                }

                const userLogrosMap: Record<string, LogroAlumno> = {};
                if (data.logros_alumno) {
                    data.logros_alumno.forEach((la: LogroAlumno) => {
                        userLogrosMap[la.logro_id] = la;
                    });
                }
                setUserLogros(userLogrosMap);
            } catch (error) {
                console.error('Error cargando logros:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const categories = ['todos', ...Array.from(new Set(allLogros.map(l => l.categoria)))];

    const filteredLogros = filter === 'todos'
        ? allLogros
        : allLogros.filter(l => l.categoria === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
            </div>
        );
    }

    const totalPuntos = Object.values(userLogros).reduce((sum, la) => sum + la.logro.puntos, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-nautical-black via-nautical-black to-[#0a1628] text-white pb-20">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredLogros.map(logro => {
                        const obtenido = userLogros[logro.id];
                        return (
                            <div
                                key={logro.id}
                                className={`relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden group ${obtenido
                                    ? 'bg-white/5 border-white/20'
                                    : 'bg-black/40 border-white/5 grayscale opacity-60'
                                    }`}
                            >
                                {/* Decoración de fondo si obtenido */}
                                {obtenido && (
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all" />
                                )}

                                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl transition-transform duration-500 group-hover:scale-110 ${obtenido
                                        ? 'bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-500 ring-4 ring-yellow-500/10'
                                        : 'bg-white/5 border-2 border-white/10 text-white/20'
                                        }`}>
                                        {obtenido ? logro.icono : '🔒'}
                                    </div>

                                    <div>
                                        <h3 className={`text-lg font-bold mb-1 ${obtenido ? 'text-white' : 'text-white/40'}`}>
                                            {params.locale === 'eu' ? logro.nombre_eu : logro.nombre_es}
                                        </h3>
                                        <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                                            {params.locale === 'eu' ? logro.descripcion_eu : logro.descripcion_es}
                                        </p>
                                    </div>

                                    <div className="pt-2 flex flex-col items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${logro.rareza === 'legendario' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' :
                                            logro.rareza === 'epico' ? 'border-purple-500/50 text-purple-500 bg-purple-500/5' :
                                                logro.rareza === 'raro' ? 'border-blue-500/50 text-blue-500 bg-blue-500/5' :
                                                    'border-white/10 text-white/40'
                                            }`}>
                                            {logro.rareza}
                                        </span>
                                        {obtenido && (
                                            <span className="text-[10px] text-accent/60 font-mono">
                                                Obtenido el {new Date(obtenido.fecha_obtenido).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Banner de puntos si obtenido */}
                                <div className={`absolute top-4 right-4 text-[10px] font-black ${obtenido ? 'text-accent' : 'text-white/10'}`}>
                                    +{logro.puntos} PTS
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
>>>>>>> pr-286
