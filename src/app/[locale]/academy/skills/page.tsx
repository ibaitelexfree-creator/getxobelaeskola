'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';


interface Skill {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rules?: any;
}

interface StudentSkill {
    skill_id: string;
    unlocked_at: string;
    skill: Skill;
}

export default function SkillsPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('academy');
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [userSkills, setUserSkills] = useState<Record<string, StudentSkill>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(apiUrl('/api/academy/skills'));
                const data = await res.json();

                if (data.catálogo) {
                    setAllSkills(data.catálogo);
                }

                const userSkillsMap: Record<string, StudentSkill> = {};
                if (data.habilidades_alumno) {
                    data.habilidades_alumno.forEach((s: StudentSkill) => {
                        userSkillsMap[s.skill_id] = s;
                    });
                }
                setUserSkills(userSkillsMap);
            } catch (error) {
                console.error('Error cargando habilidades:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getRankInfo = (count: number) => {
        if (count >= 10) return { name: 'Capitán', icon: '👑', color: 'bg-yellow-500', next: null };
        if (count >= 7) return { name: 'Patrón', icon: '⚓', color: 'bg-purple-500', next: 10 };
        if (count >= 4) return { name: 'Timonel', icon: '舵', color: 'bg-blue-500', next: 7 };
        if (count >= 1) return { name: 'Marinero', icon: '⛵', color: 'bg-green-500', next: 4 };
        return { name: 'Grumete', icon: '🪵', color: 'bg-stone-500', next: 1 };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
            </div>
        );
    }

    const earnedCount = Object.keys(userSkills).length;
    const rank = getRankInfo(earnedCount);
    const progressToNext = rank.next ? (earnedCount / rank.next) * 100 : 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-nautical-black via-nautical-black to-[#0a1628] text-white pb-20">
            {/* Header / Rank Display */}
            <div className="relative border-b border-white/10 overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${rank.color}`} />
                <div className="container mx-auto px-6 py-16 relative">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Rank Emblem */}
                        <div className="relative group">
                            <div className={`w-40 h-40 rounded-full ${rank.color} flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/20 relative z-10 transition-transform duration-500 group-hover:scale-105`}>
                                {rank.icon}
                            </div>
                            <div className={`absolute inset-0 rounded-full ${rank.color} blur-3xl opacity-20 animate-pulse`} />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <Link href={`/${params.locale}/academy/dashboard`} className="text-accent text-sm hover:underline mb-4 inline-block">
                                ← Volver al Panel
                            </Link>
                            <h1 className="text-5xl font-display italic text-white mb-2">Tu Rango: <span className="text-white font-black">{rank.name}</span></h1>
                            <p className="text-white/60 mb-8 max-w-xl">
                                Has desbloqueado {earnedCount} de {allSkills.length} habilidades técnicas. Sigue navegando para alcanzar el rango de Capitán.
                            </p>

                            {/* Rank Progress Bar */}
                            <div className="max-w-md">
                                <div className="flex justify-between text-[10px] uppercase tracking-widest font-black mb-3">
                                    <span className="text-white/40">Progreso de Rango</span>
                                    <span className="text-accent">{earnedCount} / {rank.next || allSkills.length} SKILLS</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${rank.color}`}
                                        style={{ width: `${progressToNext}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Exam Section */}
            <div className="container mx-auto px-6 pt-12 pb-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-8 rounded-3xl border border-blue-500/30 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xs font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                Nuevo
                            </span>
                            <span className="text-2xs font-black uppercase tracking-[0.2em] text-white/40">
                                Oficial DGMM
                            </span>
                        </div>
                        <h2 className="text-3xl font-display italic text-white mb-2">Examen Final Simulado (PER)</h2>
                        <p className="text-white/60 max-w-xl text-sm leading-relaxed">
                            Pon a prueba tus conocimientos con un examen completo de 60 preguntas y 90 minutos, simulando las condiciones reales del examen oficial. Incluye revisión detallada.
                        </p>
                    </div>

                    <Link
                        href={`/${params.locale}/academy/skills/simulation`}
                        className="relative z-10 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shrink-0"
                    >
                        <span>Comenzar Simulacro</span>
                        <span className="text-xl">⏱️</span>
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20">
                <h2 className="text-3xl font-display italic mb-12 flex items-center gap-4">
                    <span className="text-accent">⚡</span> Árbol de Habilidades
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allSkills.map(skill => {
                        const unlocked = userSkills[skill.id];
                        return (
                            <div
                                key={skill.id}
                                className={`relative p-8 rounded-3xl border transition-all duration-300 group ${unlocked
                                    ? 'bg-white/5 border-white/20 hover:border-accent/50'
                                    : 'bg-black/40 border-white/5 grayscale opacity-50'
                                    }`}
                            >
                                <div className="flex items-start gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110 ${unlocked
                                        ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20'
                                        : 'bg-white/5 text-white/20 border border-white/10'
                                        }`}>
                                        {unlocked ? skill.icon : '🔒'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] uppercase tracking-widest text-accent font-black mb-1">
                                            {skill.category}
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${unlocked ? 'text-white' : 'text-white/40'}`}>
                                            {skill.name}
                                        </h3>
                                        <p className="text-sm text-white/50 leading-relaxed mb-4">
                                            {skill.description}
                                        </p>

                                        {!unlocked && skill.rules && (
                                            <div className="text-[10px] text-white/30 italic flex items-center gap-2">
                                                <span>🎯</span>
                                                <span>Desbloqueo: {skill.rules.description || 'Cumple los requisitos del curso'}</span>
                                            </div>
                                        )}

                                        {unlocked && (
                                            <div className="inline-flex items-center gap-2 text-[10px] text-accent font-bold uppercase tracking-wider">
                                                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                                                Habilidad Dominada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
