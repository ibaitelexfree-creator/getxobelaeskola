'use client';

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/platform';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Flame, BookOpen, Shield, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardUser {
    id: string;
    nombre: string;
    apellidos: string;
    avatar_url: string;
    xp: number;
    current_streak: number;
    public_profile: boolean;
    modules_completed: number;
}

export default function LeaderboardClient({
    locale,
    translations: t
}: {
    locale: string,
    translations: any
}) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPublic, setIsPublic] = useState(false);
    const [togglingPrivacy, setTogglingPrivacy] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(getApiUrl('/api/student/leaderboard'));
                const json = await res.json();

                if (json.error) {
                    console.error('Error:', json.error);
                    return;
                }

                setLeaderboard(json.leaderboard);
                setCurrentUserId(json.currentUserId);

                const currentUser = json.leaderboard.find((u: LeaderboardUser) => u.id === json.currentUserId);
                if (currentUser) {
                    setIsPublic(currentUser.public_profile);
                } else {
                    checkPrivacy();
                }
            } catch (e) {
                console.error('Error fetching leaderboard:', e);
            } finally {
                setLoading(false);
            }
        };

        const checkPrivacy = async () => {
             const supabase = createClient();
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                 const { data } = await supabase.from('profiles').select('public_profile').eq('id', user.id).single();
                 if (data) setIsPublic(data.public_profile || false);
                 setCurrentUserId(user.id);
             }
        }

        fetchLeaderboard();
    }, []);

    const togglePrivacy = async () => {
        setTogglingPrivacy(true);
        const newValue = !isPublic;
        try {
            const res = await fetch(getApiUrl('/api/student/profile/privacy'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_profile: newValue })
            });
            if (res.ok) {
                setIsPublic(newValue);
                // Refresh leaderboard locally
                setLeaderboard(prev => prev.map(u => {
                    if (u.id === currentUserId) {
                        return { ...u, public_profile: newValue };
                    }
                    return u;
                }));
            }
        } catch (e) {
            console.error('Error toggling privacy:', e);
        } finally {
            setTogglingPrivacy(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nautical-black text-white relative overflow-hidden">
             <div className="bg-mesh fixed inset-0 z-0 pointer-events-none" />

             <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 pt-20">
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${locale}/student/dashboard`} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display italic">{t.title}</h1>
                        <p className="text-white/50 text-sm">{t.subtitle}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {leaderboard.length === 0 ? (
                            <div className="bg-card p-8 rounded-sm border border-white/5 text-center">
                                <p className="text-white/50">{t.empty_state}</p>
                            </div>
                        ) : (
                            <div className="bg-card rounded-sm border border-white/5 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
                                        <tr>
                                            <th className="p-4 text-center w-16">#</th>
                                            <th className="p-4 text-left">{t.sailor}</th>
                                            <th className="p-4 text-center hidden md:table-cell">{t.modules}</th>
                                            <th className="p-4 text-center hidden md:table-cell">{t.streak}</th>
                                            <th className="p-4 text-right">{t.xp}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {leaderboard.map((user, index) => {
                                            const isMe = user.id === currentUserId;
                                            const isAnonymous = !user.public_profile && !isMe;

                                            return (
                                                <tr key={user.id} className={`group hover:bg-white/5 transition-colors ${isMe ? 'bg-accent/5' : ''}`}>
                                                    <td className="p-4 text-center font-mono text-white/50">
                                                        {index < 3 ? (
                                                            <span className={`text-xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-amber-600'}`}>
                                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                            </span>
                                                        ) : (
                                                            index + 1
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                                {isAnonymous ? (
                                                                    <Shield size={14} className="text-white/30" />
                                                                ) : user.avatar_url ? (
                                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="text-xs font-bold text-white/50">
                                                                        {(user.nombre?.[0] || 'U') + (user.apellidos?.[0] || '')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className={`font-medium ${isMe ? 'text-accent' : 'text-white'}`}>
                                                                    {isMe ? `${user.nombre} (${t.my_position})` : (isAnonymous ? t.anonymous_user : `${user.nombre} ${user.apellidos || ''}`)}
                                                                </div>
                                                                {!isAnonymous && <div className="text-[10px] text-white/30 uppercase tracking-wider">{t.level} {Math.floor(user.xp / 1000) + 1}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center hidden md:table-cell">
                                                        <div className="flex items-center justify-center gap-2 text-white/60">
                                                            <BookOpen size={14} />
                                                            <span>{user.modules_completed}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center hidden md:table-cell">
                                                        <div className="flex items-center justify-center gap-2 text-orange-400/80">
                                                            <Flame size={14} />
                                                            <span>{user.current_streak}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="font-mono font-bold text-accent">
                                                            {user.xp.toLocaleString()} XP
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-card p-6 rounded-sm border border-white/5 sticky top-24">
                            <h3 className="text-lg font-display italic mb-4">{t.privacy_title}</h3>
                            <p className="text-sm text-white/50 mb-6 leading-relaxed">
                                {t.privacy_desc}
                            </p>

                            <button
                                onClick={togglePrivacy}
                                disabled={togglingPrivacy}
                                className={`w-full p-4 rounded-sm border flex items-center justify-between transition-all ${
                                    isPublic
                                    ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {isPublic ? <Globe size={18} /> : <Lock size={18} />}
                                    <span className="text-sm font-bold uppercase tracking-wider">
                                        {isPublic ? t.public : t.private}
                                    </span>
                                </div>
                                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isPublic ? 'bg-accent' : 'bg-white/10'}`}>
                                    <div className={`w-3 h-3 bg-nautical-black rounded-full shadow-sm transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </button>

                            <p className="text-[10px] text-white/30 mt-4 text-center">
                                {isPublic
                                    ? "Tus compañeros pueden ver tu nombre y progreso."
                                    : "Apareces como 'Usuario Anónimo' en el ranking."}
                            </p>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
}
