'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Sparkles, LogOut, ChevronRight, Settings, CreditCard, Shield } from 'lucide-react';
import EditProfileModal from '@/components/student/EditProfileModal';
import LogoutButton from '@/components/auth/LogoutButton';

interface Profile {
    id: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    rol: string;
    status_socio?: string;
    dni?: string;
}

export default function MobileProfileClient({
    profile,
    email,
    locale
}: {
    profile: Profile;
    email: string;
    locale: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<Profile>(profile);
    const isSocio = currentProfile?.status_socio === 'activo';

    return (
        <div className="pb-24 bg-nautical-black min-h-screen">
            {/* Header */}
            <div className="pt-12 px-6 pb-8 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent/20 mb-4 bg-white/5">
                        <Image
                            src="/images/default-student-avatar.png"
                            alt={currentProfile?.nombre || 'Student'}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <h1 className="text-2xl font-display text-white">{currentProfile?.nombre} {currentProfile?.apellidos}</h1>
                    <p className="text-white/40 text-sm mt-1">{email}</p>

                    {isSocio && (
                        <div className="mt-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 border border-yellow-200 shadow-[0_0_15px_rgba(252,211,77,0.3)] flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-yellow-900" />
                            <span className="text-yellow-900 text-[10px] font-black uppercase tracking-widest">Socio Oficial</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 space-y-6 mt-4">
                {/* Personal Info */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Cuenta</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-white font-medium text-sm">Datos Personales</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </button>

                        <div className="w-full flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <span className="text-white font-medium text-sm">Rol</span>
                            </div>
                            <span className="text-white/40 text-xs uppercase tracking-wider">{currentProfile?.rol || 'Estudiante'}</span>
                        </div>
                    </div>
                </section>

                {/* Membership */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Membresía</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        {isSocio ? (
                            <>
                                <Link
                                    href={`/${locale}/student/membership/card`}
                                    className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-white font-medium text-sm block">Carnet Digital</span>
                                            <span className="text-white/40 text-[10px]">Ver tarjeta de socio</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20" />
                                </Link>
                                {/* Portal link handled via separate component or logic but sticking to basic link for now or button */}
                            </>
                        ) : (
                            <Link
                                href={`/${locale}/academy/membership`}
                                className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-white font-medium text-sm block">Hazte Socio</span>
                                        <span className="text-accent text-[10px]">Ver ventajas y descuentos</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/20" />
                            </Link>
                        )}
                    </div>
                </section>

                {/* Logout */}
                <div className="pt-4">
                    <LogoutButton locale={locale} />
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                profile={currentProfile}
                onProfileUpdate={(updated) => {
                    setCurrentProfile(updated);
                    setIsEditing(false);
                }}
            />
        </div>
    );
}
