'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Sparkles, LogOut, ChevronRight, Settings, CreditCard, Shield, Globe, Compass, Book, Ship, Anchor } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import EditProfileModal from '@/components/student/EditProfileModal';
import SafetySettingsModal from '@/components/student/SafetySettingsModal';
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
    profile: initialProfile,
    email: initialEmail,
    locale
}: {
    profile?: Profile | null;
    email?: string;
    locale: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSafetySettingsOpen, setIsSafetySettingsOpen] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(initialProfile || null);
    const [currentEmail, setCurrentEmail] = useState<string>(initialEmail || '');
    const [loading, setLoading] = useState(!initialProfile);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function loadProfile() {
            if (currentProfile) {
                setLoading(false);
                return;
            }

            // Use getSession for faster check on mobile
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user) {
                router.replace(`/${locale}/auth/login?returnTo=/${locale}/student/profile`);
                return;
            }

            setCurrentEmail(user.email || '');

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setCurrentProfile(profile);
            }
            setLoading(false);
        }

        loadProfile();
    }, [supabase, locale, router, currentProfile]);

    const isSocio = currentProfile?.status_socio === 'activo';

    const handleLanguageSwitch = (targetLocale: string) => {
        if (targetLocale === locale) return;
        document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
        let path = window.location.pathname;
        if (path.startsWith(`/${locale}`)) {
            path = path.replace(`/${locale}`, `/${targetLocale}`);
        } else {
            path = `/${targetLocale}${path}`;
        }
        window.location.assign(path);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

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
                    <h1 className="text-2xl font-display text-white">
                        {currentProfile?.nombre || 'Navegante'} {currentProfile?.apellidos || ''}
                    </h1>
                    <p className="text-white/40 text-sm mt-1">{currentEmail}</p>

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

                {/* Safety & Settings */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Seguridad</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setIsSafetySettingsOpen(true)}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Alertas de Seguridad</span>
                                    <span className="text-white/40 text-[10px]">Configurar sirena y avisos</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </button>
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
                            </>
                        ) : (
                            <Link
                                href={`/${locale}/student/membership`}
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
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Herramientas de Academia</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <Link
                            href={`/${locale}/academy/exploration`}
                            prefetch={false}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Compass className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Mapa de Constelaciones</span>
                                    <span className="text-white/40 text-[10px]">Modo Exploración</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </Link>

                        <Link
                            href={`/${locale}/academy/logbook`}
                            prefetch={false}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <Book className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Cuaderno de Bitácora</span>
                                    <span className="text-white/40 text-[10px]">Tu diario de navegación</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </Link>

                        <Link
                            href={`/${locale}/academy/tools/nomenclature`}
                            prefetch={false}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Ship className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Partes del Barco</span>
                                    <span className="text-white/40 text-[10px]">Nomenclatura Marítima</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </Link>

                        <Link
                            href={`/${locale}/academy/tools/chart-plotter`}
                            prefetch={false}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Navegación</span>
                                    <span className="text-white/40 text-[10px]">Cartografía y Trazado</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </Link>

                        <Link
                            href={`/${locale}/academy/tools/knots`}
                            prefetch={false}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                                    <Anchor className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Nudos</span>
                                    <span className="text-white/40 text-[10px]">Maniobra de Cabuyería</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </Link>

                        <Link
                            href={`/${locale}/academy/tools/wind-lab`}
                            prefetch={false}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors border-b border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                    <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center">
                                        <div className="w-1 h-3 bg-current rotate-45" />
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Meteorología</span>
                                    <span className="text-white/40 text-[10px]">Laboratorio de Viento</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </Link>

                        <Link
                            href={`/${locale}/academy/skills`}
                            prefetch={false}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-medium text-sm block">Seguridad</span>
                                    <span className="text-white/40 text-[10px]">Habilidades Técnicas</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </Link>
                    </div>
                </section>

                {/* Language Switch */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Idioma</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex divide-x divide-white/10">
                        <button
                            onClick={() => handleLanguageSwitch('es')}
                            className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${locale === 'es' ? 'bg-accent/10 border-b-2 border-b-accent' : 'active:bg-white/5'}`}
                        >
                            <span className={`text-[8px] font-black ${locale === 'es' ? 'text-accent' : 'text-white/40'}`}>ES</span>
                            <span className={`text-xs ${locale === 'es' ? 'text-white' : 'text-white/40'}`}>Español</span>
                        </button>
                        <button
                            onClick={() => handleLanguageSwitch('eu')}
                            className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${locale === 'eu' ? 'bg-accent/10 border-b-2 border-b-accent' : 'active:bg-white/5'}`}
                        >
                            <span className={`text-[8px] font-black ${locale === 'eu' ? 'text-accent' : 'text-white/40'}`}>EU</span>
                            <span className={`text-xs ${locale === 'eu' ? 'text-white' : 'text-white/40'}`}>Euskara</span>
                        </button>
                        <button
                            onClick={() => handleLanguageSwitch('en')}
                            className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${locale === 'en' ? 'bg-accent/10 border-b-2 border-b-accent' : 'active:bg-white/5'}`}
                        >
                            <span className={`text-[8px] font-black ${locale === 'en' ? 'text-accent' : 'text-white/40'}`}>EN</span>
                            <span className={`text-xs ${locale === 'en' ? 'text-white' : 'text-white/40'}`}>English</span>
                        </button>
                    </div>
                </section>

                {/* Logout */}
                <div className="pt-4">
                    <LogoutButton locale={locale} />
                </div>
            </div>

            {currentProfile && (
                <EditProfileModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    profile={currentProfile}
                    onProfileUpdate={(updated) => {
                        setCurrentProfile(updated);
                        setIsEditing(false);
                    }}
                />
            )}

            <SafetySettingsModal
                isOpen={isSafetySettingsOpen}
                onClose={() => setIsSafetySettingsOpen(false)}
            />
        </div>
    );
}


