'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import EditProfileModal from './EditProfileModal';
import LogoutButton from '@/components/auth/LogoutButton';

interface Profile {
    id: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    rol: string;
}

interface StudentProfileSidebarProps {
    profile: Profile;
    email: string;
    locale: string;
}

export default function StudentProfileSidebar({ profile, email, locale }: StudentProfileSidebarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<Profile>(profile);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Initial render might miss phone number if not fetched in server component (it was fetched with `*` so it should be fine).

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
                    <span className="text-[8px] uppercase tracking-[0.4em] text-accent font-black mt-2">Miembro verificado</span>
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
                    setCurrentProfile(updated); // Update local state immediately
                    setIsEditing(false);
                }}
            />
        </aside>
    );
}
