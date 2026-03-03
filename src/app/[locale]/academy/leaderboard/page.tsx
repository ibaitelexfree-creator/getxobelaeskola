'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Trophy, Medal, Crown, Shield, Activity, Book, Eye, EyeOff, Users, ArrowLeft } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import AcademySkeleton from '@/components/academy/AcademySkeleton';

interface LeaderboardUser {
    id: string;
    rank: number;
    nombre: string;
    apellidos: string;
    avatar_url: string | null;
    total_xp: number;
    current_streak: number;
    modules_completed: number;
    is_current_user: boolean;
}

interface LeaderboardData {
    leaderboard: LeaderboardUser[];
    currentUser: LeaderboardUser | null;
    visibility: 'public' | 'anonymous' | 'private';
}

export default function LeaderboardPage({ params }: { params: { locale: string } }) {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingVisibility, setSavingVisibility] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(apiUrl('/api/academy/leaderboard'));
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVisibilityChange = async (newVisibility: string) => {
        setSavingVisibility(true);
        try {
            const res = await fetch(apiUrl('/api/academy/leaderboard/settings'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visibility: newVisibility })
            });

            if (res.ok) {
                setData(prev => prev ? { ...prev, visibility: newVisibility as any } : null);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSavingVisibility(false);
        }
    };

    if (loading) return <AcademySkeleton />;

    if (!data) return (
        <div className="min-h-screen bg-nautical-black flex items-center justify-center">
            <div className="text-white/40 text-center">
                <p>No se pudo cargar la clasificación.</p>
                <Link href={`/${params.locale}/academy/dashboard`} className="text-accent hover:underline mt-4 block text-sm">
                    Volver al Dashboard
                </Link>
            </div>
        </div>
    );

    const { leaderboard, currentUser, visibility } = data;

    return (
        <div className="min-h-screen bg-nautical-black text-white pb-20">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent" />
                <div className="container mx-auto px-6 py-8 relative">
                    <Link href={`/${params.locale}/academy/dashboard`} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6">
                        <ArrowLeft size={14} /> Volver al Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-display italic text-white mb-2 flex items-center gap-3">
                                <Trophy className="text-accent" size={32} />
                                Clasificación General
                            </h1>
                            <p className="text-white/60 max-w-xl">
                                Compara tu progreso con otros navegantes de la escuela. Gana XP completando cursos y desafíos diarios.
                            </p>
                        </div>

                        {/* Visibility Settings */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-2 min-w-[250px]">
                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Tu Visibilidad</span>
                            <div className="flex gap-1 bg-black/40 p-1 rounded">
                                {[
                                    { id: 'public', label: 'Público', icon: Users },
                                    { id: 'anonymous', label: 'Anónimo', icon: EyeOff },
                                    { id: 'private', label: 'Privado', icon: Eye }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleVisibilityChange(option.id)}
                                        disabled={savingVisibility}
                                        className={`flex-1 py-2 px-2 rounded text-[10px] uppercase tracking-wider font-bold flex flex-col items-center gap-1 transition-all
                                            ${visibility === option.id
                                                ? 'bg-accent text-nautical-black shadow-lg scale-105'
                                                : 'text-white/40 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <option.icon size={12} />
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[9px] text-white/30 text-center mt-1">
                                {visibility === 'private' ? 'No apareces en la tabla.' :
                                 visibility === 'anonymous' ? 'Apareces como "Navegante Anónimo".' :
                                 'Tu nombre y avatar son visibles.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Current User Stats */}
                {currentUser && (
                    <div className="mb-12 bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Medal size={120} />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="flex flex-col items-center">
                                <div className="text-5xl font-black text-white italic tracking-tighter">#{currentUser.rank}</div>
                                <div className="text-[10px] uppercase tracking-widest text-accent font-bold">Tu Posición</div>
                            </div>

                            <div className="h-12 w-px bg-white/10 hidden md:block" />

                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent/30 bg-white/5">
                                    {currentUser.avatar_url ? (
                                        <Image src={currentUser.avatar_url} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">⛵</div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white">{currentUser.nombre} {currentUser.apellidos}</div>
                                    <div className="text-xs text-white/60 flex items-center gap-2">
                                        <span className="flex items-center gap-1"><Activity size={12} className="text-accent" /> {currentUser.total_xp} XP</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Book size={12} className="text-blue-400" /> {currentUser.modules_completed} Módulos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{currentUser.total_xp}</div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/40">XP Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
                                        {currentUser.current_streak} <span className="text-base">🔥</span>
                                    </div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/40">Racha</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">{currentUser.modules_completed}</div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/40">Módulos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-bold w-16 text-center">Pos</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Navegante</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">XP Total</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Módulos</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Racha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leaderboard.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`group transition-colors ${user.is_current_user ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-white/5'}`}
                                    >
                                        <td className="p-4 text-center">
                                            {user.rank === 1 ? <Crown size={20} className="text-yellow-400 mx-auto" fill="currentColor" /> :
                                             user.rank === 2 ? <Medal size={20} className="text-gray-300 mx-auto" /> :
                                             user.rank === 3 ? <Medal size={20} className="text-amber-600 mx-auto" /> :
                                             <span className="font-mono text-white/40 font-bold">#{user.rank}</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`relative w-10 h-10 rounded-full overflow-hidden border ${user.is_current_user ? 'border-accent' : 'border-white/10'} bg-white/5`}>
                                                    {user.avatar_url ? (
                                                        <Image src={user.avatar_url} alt={user.nombre} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs">⛵</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${user.is_current_user ? 'text-accent' : 'text-white'}`}>
                                                        {user.nombre} {user.apellidos}
                                                    </div>
                                                    {user.is_current_user && (
                                                        <div className="text-[9px] uppercase tracking-wider text-accent/60">Tú</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-white">
                                            {user.total_xp.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right font-mono text-white/70">
                                            {user.modules_completed}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="inline-flex items-center gap-1 font-mono text-amber-500">
                                                {user.current_streak} <span className="text-xs">🔥</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {leaderboard.length === 0 && (
                        <div className="p-12 text-center text-white/40">
                            No hay datos suficientes para mostrar la clasificación.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
