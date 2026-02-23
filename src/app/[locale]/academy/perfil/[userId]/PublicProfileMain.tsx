'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PublicProfileHeader from '@/components/academy/profile/PublicProfileHeader';
import PublicStatsGrid from '@/components/academy/profile/PublicStatsGrid';
import PublicBadgesGrid from '@/components/academy/profile/PublicBadgesGrid';
import PublicLogbookList from '@/components/academy/profile/PublicLogbookList';
import PublicCertificatesGrid from '@/components/academy/profile/PublicCertificatesGrid';
import ShareProfileButton from '@/components/academy/profile/ShareProfileButton';
import ProfileVisibilityToggle from '@/components/academy/profile/ProfileVisibilityToggle';
import { Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PublicProfileData {
    profile: any;
    stats: {
        modulesCompleted: number;
        coursesCompleted: number;
        totalHours: number;
        totalMiles: string;
    };
    badges: any[];
    logbook: any[];
    certificates: any[];
    isOwner: boolean;
    error?: string;
}

export default function PublicProfileMain({ params }: { params: { locale: string; userId: string } }) {
    const { userId, locale } = params;
    const [data, setData] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Get Profile & Check Visibility
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, nombre, apellidos, avatar_url, is_public, rol')
                    .eq('id', userId)
                    .single();

                if (profileError || !profile) {
                    console.error('Error fetching profile:', profileError);
                    setLoading(false);
                    return;
                }

                // Check if public or if requester is owner
                const { data: { user } } = await supabase.auth.getUser();
                const isOwner = user?.id === userId;

                if (!profile.is_public && !isOwner) {
                    setData({ error: 'private', isOwner: false } as any);
                    setLoading(false);
                    return;
                }

                // 2. Fetch Stats
                const { data: progress } = await supabase
                    .from('progreso_alumno')
                    .select('*')
                    .eq('alumno_id', userId);

                const modulesCompleted = progress?.filter((p: any) => p.tipo_entidad === 'modulo' && p.estado === 'completado').length || 0;
                const coursesCompleted = progress?.filter((p: any) => p.tipo_entidad === 'curso' && p.estado === 'completado').length || 0;

                // 3. Fetch Badges
                const { data: badges } = await supabase
                    .from('logros_alumno')
                    .select(`
                        fecha_obtenido,
                        logro:logros (
                            id, slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, icono, rareza
                        )
                    `)
                    .eq('alumno_id', userId);

                // 4. Fetch Logbook
                const { data: logbook } = await supabase
                    .from('horas_navegacion')
                    .select('*')
                    .eq('alumno_id', userId)
                    .order('fecha', { ascending: false })
                    .limit(20);

                const totalHours = logbook?.reduce((acc: number, entry: any) => acc + (Number(entry.duracion_h) || 0), 0) || 0;

                // 5. Fetch Certificates
                const { data: certificates } = await supabase
                    .from('certificados')
                    .select(`
                        *,
                        curso:cursos (nombre_es, nombre_eu),
                        nivel:niveles_formacion (nombre_es, nombre_eu)
                    `)
                    .eq('alumno_id', userId);

                setData({
                    profile,
                    stats: {
                        modulesCompleted,
                        coursesCompleted,
                        totalHours,
                        totalMiles: (totalHours * 5.2).toFixed(1)
                    },
                    badges: badges || [],
                    logbook: logbook || [],
                    certificates: certificates || [],
                    isOwner
                });
            } catch (error) {
                console.error('Unexpected error in PublicProfileMain:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-display text-white mb-2 italic">Perfil no encontrado</h1>
                <Link href={`/${locale}/academy/dashboard`} className="text-accent underline mt-4">Volver al Dashboard</Link>
            </div>
        );
    }

    if (data.error === 'private') {
        return (
            <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-6">
                    <Lock size={40} />
                </div>
                <h1 className="text-2xl font-display text-white mb-2 italic">Perfil Privado</h1>
                <p className="text-white/40 mb-8 max-w-xs">
                    Este perfil de navegante es privado.
                </p>
                <Link
                    href={`/${locale}/academy/dashboard`}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded transition-colors"
                >
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    const profile = (data.profile || {}) as any;
    const stats = data.stats;
    const { badges, logbook, certificates, isOwner } = data;

    return (
        <div className="min-h-screen bg-[#050b14] text-white pb-20 font-sans">
            {/* Top Bar for Owner */}
            {isOwner && (
                <div className="bg-accent/10 border-b border-accent/20 sticky top-0 z-50 backdrop-blur-md">
                    <div className="container mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                            <span>👋 Vista de Propietario</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ProfileVisibilityToggle userId={userId} initialIsPublic={!!profile?.is_public} />
                            <Link
                                href={`/${locale}/academy/dashboard`}
                                className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            >
                                Volver al Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
                    <PublicProfileHeader profile={profile} />
                    <ShareProfileButton userId={userId} />
                </div>

                <PublicStatsGrid stats={stats} />

                <div className="space-y-16">
                    <PublicBadgesGrid badges={(badges as any) || []} />
                    <PublicLogbookList logbook={(logbook as any) || []} />
                    <PublicCertificatesGrid certificates={(certificates as any) || []} studentName={`${profile?.nombre || ''} ${profile?.apellidos || ''}`} />
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="text-white/20 text-xs uppercase tracking-widest mb-2">Getxo Bela Eskola</p>
                    <p className="text-white/10 text-[10px]">Perfil Oficial de Navegante</p>
                </div>
            </div>
        </div>
    );
}
