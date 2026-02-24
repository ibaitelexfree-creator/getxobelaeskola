'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Check, Sparkles, Anchor, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiUrl } from '@/lib/api';
import LegalConsentModal from '@/components/shared/LegalConsentModal';
import { createClient } from '@/lib/supabase/client';

export default function MembershipPage({ params: { locale } }: { params: { locale: string } }) {
    const tLegal = useTranslations('legal');
    const [loading, setLoading] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    // Auth state for legal modal
    const [user, setUser] = React.useState<any>(null);
    const [profile, setProfile] = React.useState<any>(null);
    const supabase = React.useMemo(() => createClient(), []);

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profile);
            }
        };
        checkUser();
    }, [supabase]);

    const handleSubscribeClick = () => {
        if (loading) return;
        setIsLegalModalOpen(true);
    };

    const handleLegalConfirm = async (legalData: { fullName: string; email: string; dni: string }) => {
        setIsLegalModalOpen(false);
        try {
            setLoading(true);

            // 1. Log Consent
            await fetch(apiUrl('/api/legal/consent'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: legalData.fullName,
                    email: legalData.email,
                    dni: legalData.dni,
                    legalText: tLegal('consent_acceptance'),
                    consentType: 'membership',
                    referenceId: 'membership_subscription'
                })
            });

            // 2. Subscribe
            const res = await fetch(apiUrl('/api/membership/subscribe'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locale,
                    legalName: legalData.fullName,
                    legalDni: legalData.dni
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Error al iniciar suscripción');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        {
            icon: <Star className="w-5 h-5 text-brass-gold" />,
            title: "Descuento en Alquileres",
            desc: "15% off en toda la flota de J80 y cruceros."
        },
        {
            icon: <Shield className="w-5 h-5 text-blue-400" />,
            title: "Prioridad de Reserva",
            desc: "Acceso anticipado a cursos y eventos especiales."
        },
        {
            icon: <Anchor className="w-5 h-5 text-emerald-400" />,
            title: "Navegación Nocturna",
            desc: "Acceso exclusivo a travesías nocturnas supervisadas."
        },
        {
            icon: <Sparkles className="w-5 h-5 text-purple-400" />,
            title: "Merchandising",
            desc: "Pack de bienvenida y ropa oficial del equipo."
        }
    ];

    return (
        <main className="min-h-screen bg-nautical-black text-white pb-24 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#0a1628] to-nautical-black z-0" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brass-gold/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-nautical-black/80 backdrop-blur-md flex items-center gap-4">
                <Link href={`/${locale}/student/profile`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95 transition-transform">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-display italic text-white">Club de Navegación</h1>
            </header>

            <div className="relative z-10 pt-32 px-6">
                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full aspect-[4/5] sm:aspect-[2/1] bg-gradient-to-br from-[#1a2c42] to-[#0a1628] rounded-2xl border border-brass-gold/30 p-8 relative overflow-hidden shadow-2xl mb-8 group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl group-hover:scale-110 transition-transform duration-1000">⚓</div>
                    <div className="absolute inset-0 bg-[url('/images/nautical-pattern.svg')] opacity-5" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="px-3 py-1 rounded-full bg-brass-gold/20 border border-brass-gold/30 text-brass-gold text-[10px] uppercase tracking-widest font-black inline-block mb-4">
                                Premium Access
                            </div>
                            <h2 className="text-4xl font-display italic text-white leading-tight mb-2">
                                Hazte <span className="text-brass-gold">Socio</span>
                            </h2>
                            <p className="text-white/60 text-sm max-w-xs">
                                Únete a la comunidad más exclusiva del Cantábrico y navega sin límites.
                            </p>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white">20€</span>
                                <span className="text-white/40 text-sm">/ mes</span>
                            </div>
                            <p className="text-xs text-brass-gold mt-1 uppercase tracking-wider font-bold">Sin permanencia</p>
                        </div>
                    </div>
                </motion.div>

                {/* Benefits List */}
                <div className="space-y-6 mb-12">
                    <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Beneficios Incluidos</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">{benefit.title}</h4>
                                    <p className="text-xs text-white/50">{benefit.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA Action */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-nautical-black via-nautical-black/95 to-transparent z-40">
                    <button
                        onClick={handleSubscribeClick}
                        disabled={loading}
                        className="w-full py-4 bg-brass-gold text-nautical-black font-black uppercase tracking-widest text-sm rounded-lg hover:bg-white transition-all shadow-[0_0_30px_rgba(184,134,11,0.3)] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-nautical-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Unirme al Club</span>
                                <Sparkles className="w-4 h-4" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-white/20 mt-4 px-8">
                        El cobro se realizará de forma segura a través de Stripe. Puedes cancelar en cualquier momento.
                    </p>
                </div>

                <LegalConsentModal
                    isOpen={isLegalModalOpen}
                    onClose={() => setIsLegalModalOpen(false)}
                    onConfirm={handleLegalConfirm}
                    activityType="membership"
                    initialData={user ? {
                        fullName: profile ? `${profile.nombre} ${profile.apellidos}` : undefined,
                        email: user.email,
                        dni: profile?.dni
                    } : undefined}
                    legalText={tLegal('consent_acceptance')}
                />
            </div>
        </main>
    );
}
