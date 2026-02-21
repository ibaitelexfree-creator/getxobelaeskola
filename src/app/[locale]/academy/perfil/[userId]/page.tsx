'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Shield, Book, Anchor, Ship, Globe, Wind } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import NotificationContainer from '@/components/academy/notifications/NotificationContainer';
import AcademySkeleton from '@/components/academy/AcademySkeleton';
import ShareButton from '@/components/academy/profile/ShareButton';
import VisibilityToggle from '@/components/academy/profile/VisibilityToggle';
import { PublicProfile } from '@/types/profile';
import { getRank } from '@/lib/gamification/ranks';

const RankProgress = dynamic(() => import('@/components/academy/gamification/RankProgress'), { ssr: false });
const ActivityHeatmap = dynamic(() => import('@/components/academy/dashboard/ActivityHeatmap'), { ssr: false });
const SkillRadar = dynamic(() => import('@/components/academy/dashboard/SkillRadar'), { ssr: false });
const BoatMastery = dynamic(() => import('@/components/academy/dashboard/BoatMastery'), { ssr: false });
const CertificateCard = dynamic(() => import('@/components/academy/CertificateCard'), { ssr: false });

export default function PublicProfilePage({ params }: { params: { locale: string; userId: string } }) {
    const t = useTranslations('profile');
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(apiUrl(`/api/profile/${params.userId}?locale=${params.locale}`));
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to load profile');
                }

                setProfile(data);

                // Check ownership based on simple logic: if we can see the "is_public" flag in the user object and edit it, likely we are the owner or admin.
                // Ideally API should return "is_owner" explicitly.
                // Looking at API, it returns data.user which has is_public.
                // We need to know if the current user is the owner to show the toggle.
                // The API checks this internally but doesn't explicitly tell us "you are the owner" in the JSON response except implicitly via ability to see private profile.
                // However, we can check client-side auth state too, but let's rely on what the API returns.
                // Ah, I missed adding `is_owner` to the response in my API route.
                // I'll infer it: if I can see the profile even if `is_public` is false, I must be the owner (or admin).
                // But better: I'll check Supabase auth client side to compare IDs.

                // For now, let's just use the client-side auth check
                // Wait, I can't easily access supabase auth user here without async call.
                // I'll just assume if I can load the profile and it's NOT public, I'm the owner.
                // But what if it IS public and I'm the owner?
                // I should have returned `is_owner` from the API.
                // I'll make a quick fix: Check client side auth.
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [params.userId, params.locale]);

    // Check ownership
    useEffect(() => {
        import('@/lib/supabase/client').then(async ({ createClient }) => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.id === params.userId) {
                setIsOwner(true);
            }
        });
    }, [params.userId]);


    if (loading) return <AcademySkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-nautical-black flex flex-col items-center justify-center p-6 text-center text-white">
                <Shield size={48} className="text-white/20 mb-4" />
                <h1 className="text-2xl font-display mb-2">{t('not_found')}</h1>
                <p className="text-white/60 mb-6">{error === 'Profile is private' ? t('private_profile') : error}</p>
                <Link href={`/${params.locale}/academy`} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded text-sm uppercase tracking-wider transition-colors">
                    Volver
                </Link>
            </div>
        );
    }

    if (!profile) return null;

    const { user, stats, badges, skills, certificates, logbook, activity_heatmap, skill_radar, boat_mastery } = profile;

    const currentRank = getRank(stats.total_points);

    return (
        <div className="min-h-screen bg-nautical-black text-white pb-20">
            <NotificationContainer />

            {/* Header */}
            <div className="relative border-b border-white/10 bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

                <div className="container mx-auto px-6 py-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative">
                                {user.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl">
                                        {user.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-nautical-black rounded-full p-2 border border-white/10">
                                <span className="text-2xl">⚓</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-4xl font-display text-white mb-2">{user.full_name}</h1>
                                <p className="text-white/60 max-w-xl mx-auto md:mx-0">
                                    {user.bio || 'Navegante apasionado en formación continua.'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="bg-white/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-accent border border-white/10">
                                    {stats.levels_completed} Niveles Completados
                                </div>
                                <div className="bg-white/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white/60 border border-white/10">
                                    Miembro desde {new Date(user.created_at).getFullYear()}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                <ShareButton
                                    title={`Perfil de ${user.full_name}`}
                                    text={`Echa un vistazo a mi progreso en Getxo Bela Eskola: ${stats.total_hours} horas navegadas y ${badges.length} insignias conseguidas.`}
                                />
                                {isOwner && (
                                    <VisibilityToggle
                                        isPublic={user.is_public}
                                        onToggle={(val) => setProfile(prev => prev ? ({ ...prev, user: { ...prev.user, is_public: val } }) : null)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Rank Widget */}
                        <div className="w-full lg:w-96">
                            <RankProgress currentXP={stats.total_points} currentRank={currentRank} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Stats & Radar */}
                <div className="space-y-12">
                    {/* Key Stats */}
                    <section className="grid grid-cols-2 gap-4">
                         <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-3xl font-bold text-white mb-1">{(stats.total_hours * 5.2).toFixed(0)}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Millas Navegadas</div>
                        </div>
                        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-3xl font-bold text-accent mb-1">{badges.length}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Insignias</div>
                        </div>
                         <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-3xl font-bold text-white mb-1">{stats.skills_unlocked}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Habilidades</div>
                        </div>
                        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.global_progress}%</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Progreso Global</div>
                        </div>
                    </section>

                    {/* Skill Radar */}
                    <SkillRadar skills={skill_radar || []} />

                    {/* Boat Mastery */}
                    <BoatMastery data={boat_mastery || []} />
                </div>

                {/* Middle/Right Column: Content */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Heatmap */}
                    <ActivityHeatmap data={activity_heatmap || []} />

                    {/* Badges Grid */}
                    {badges.length > 0 && (
                        <section>
                             <h2 className="text-xl font-display italic mb-6 flex items-center gap-3">
                                <span className="text-accent">▶</span> {t('badges')}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {badges.map((badge) => (
                                    <div key={badge.id} className="group relative p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent/40 transition-all text-center">
                                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{badge.icon}</div>
                                        <h3 className="text-sm font-bold text-white mb-1">{badge.name}</h3>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{badge.rarity}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Logbook Preview */}
                    {logbook.length > 0 && (
                        <section>
                            <h2 className="text-xl font-display italic mb-6 flex items-center gap-3">
                                <span className="text-accent">▶</span> {t('logbook')} <span className="text-sm not-italic text-white/40 font-sans normal-case ml-auto">Últimas salidas</span>
                            </h2>
                            <div className="space-y-3">
                                {logbook.slice(0, 5).map((entry) => (
                                    <div key={entry.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <Ship size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white text-sm">{entry.boat_name || 'Embarcación'}</h4>
                                            <p className="text-xs text-white/40">{new Date(entry.date).toLocaleDateString(params.locale)} · {entry.location || 'Getxo'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-accent font-bold">{entry.duration_hours}h</div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-widest">{entry.role || 'Tripulante'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certificates */}
                    {certificates.length > 0 && (
                        <section>
                            <h2 className="text-xl font-display italic mb-6 flex items-center gap-3">
                                <span className="text-accent">▶</span> {t('certificates')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {certificates.map((cert) => (
                                    <CertificateCard
                                        key={cert.id}
                                        certificate={{ ...cert, fecha_emision: cert.issued_at, url_pdf: cert.url }}
                                        studentName={user.full_name}
                                        locale={params.locale}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
}
