'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EditProfileModal from './EditProfileModal';
import LogoutButton from '@/components/auth/LogoutButton';

interface Profile {
    id: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    rol: string;
    status_socio?: string;
}

interface StudentProfileSidebarProps {
    profile: Profile;
    email: string;
    locale: string;
}

export default function StudentProfileSidebar({ profile, email, locale }: StudentProfileSidebarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<Profile>(profile);
    const [portalLoading, setPortalLoading] = useState(false);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handleManageMembership = async () => {
        try {
            setPortalLoading(true);
            const res = await fetch('/api/membership/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Error al abrir el portal de pagos');
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('Error de conexión');
        } finally {
            setPortalLoading(false);
        }
    };

    const isSocio = currentProfile?.status_socio === 'activo';

    return (
        <aside className="space-y-8">
            <div className="bg-card p-8 border border-card-border rounded-sm backdrop-blur-md">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent/20 mb-4 bg-white/5">
                        <Image
                            src="/images/default-student-avatar.png"
                            alt={currentProfile?.nombre || 'Student'}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <h3 className="text-xl font-display italic text-white">{currentProfile?.nombre} {currentProfile?.apellidos}</h3>
                    <div className="flex flex-col items-center gap-1 mt-2">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-accent font-black">Miembro verificado</span>
                        {isSocio && (
                            <span className="text-[10px] font-bold text-brass-gold flex items-center gap-1">
                                <span className="animate-pulse">⚓</span> SOCIO GETXO BELA
                            </span>
                        )}
                    </div>
                </div>

                <h3 className="text-3xs uppercase tracking-widest text-white/40 mb-6 font-bold">Información de Cuenta</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-3xs uppercase tracking-widest text-foreground/40">Email</p>
                        <p className="text-sm font-light">{email}</p>
                    </div>
                    <div>
                        <p className="text-3xs uppercase tracking-widest text-foreground/40">Rol</p>
                        <p className="text-sm font-light uppercase tracking-wider" title="Tu nivel de acceso actual en el sistema de la escuela.">{currentProfile?.rol || 'Estudiante'}</p>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 border border-white/5 text-3xs uppercase tracking-widest hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                    >
                        Editar Perfil
                    </button>

                    {isSocio && (
                        <div className="space-y-2">
                            <button
                                onClick={handleManageMembership}
                                disabled={portalLoading}
                                className="w-full py-3 bg-white/5 border border-accent/20 text-[9px] uppercase tracking-widest font-bold text-accent hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
                            >
                                {portalLoading ? 'Cargando...' : '⚙️ Gestionar Suscripción'}
                            </button>
                            <Link
                                href={`/${locale}/student/membership/card`}
                                className="w-full py-3 bg-brass-gold/10 border border-brass-gold/30 text-[9px] uppercase tracking-widest font-bold text-brass-gold hover:bg-brass-gold/20 transition-all flex items-center justify-center gap-2"
                            >
                                🆔 Mi Carnet de Socio
                            </Link>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/5">
                        <LogoutButton locale={locale} />
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                profile={currentProfile}
                onProfileUpdate={(updated) => {
                    setCurrentProfile(updated);
                    setIsEditing(false);
                }}
            />
        </aside>
    );
}
