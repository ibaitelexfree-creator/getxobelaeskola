import { notFound } from 'next/navigation';
import { getPublicProfile } from '@/lib/academy/profile';
import PublicProfileHeader from '@/components/academy/profile/PublicProfileHeader';
import PublicStatsGrid from '@/components/academy/profile/PublicStatsGrid';
import PublicBadgesGrid from '@/components/academy/profile/PublicBadgesGrid';
import PublicLogbookList from '@/components/academy/profile/PublicLogbookList';
import PublicCertificatesGrid from '@/components/academy/profile/PublicCertificatesGrid';
import ShareProfileButton from '@/components/academy/profile/ShareProfileButton';
import ProfileVisibilityToggle from '@/components/academy/profile/ProfileVisibilityToggle';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default async function PublicProfilePage({ params }: { params: { locale: string; userId: string } }) {
    const { userId, locale } = params;

    const data = await getPublicProfile(userId);

    if (!data) {
        notFound();
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

    const { profile, stats, badges, logbook, certificates, isOwner } = data;

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
                            <ProfileVisibilityToggle userId={userId} initialIsPublic={profile.is_public} />
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
                    <PublicBadgesGrid badges={badges} />
                    <PublicLogbookList logbook={logbook} />
                    <PublicCertificatesGrid certificates={certificates} studentName={`${profile.nombre} ${profile.apellidos}`} />
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="text-white/20 text-xs uppercase tracking-widest mb-2">Getxo Bela Eskola</p>
                    <p className="text-white/10 text-[10px]">Perfil Oficial de Navegante</p>
                </div>
            </div>
        </div>
    );
}
