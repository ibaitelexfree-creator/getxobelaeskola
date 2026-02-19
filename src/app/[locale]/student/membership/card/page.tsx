'use client';
import React, { useRef, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { ShieldAlert, ShieldCheck, UserCircle2, ArrowRight, Lock, LogIn } from 'lucide-react';

export default function MembershipCardPage({ params: { locale } }: { params: { locale: string } }) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [qrCode, setQrCode] = useState<string>('');
    const cardRef = useRef<HTMLDivElement>(null);

    // Mouse movement for tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    useEffect(() => {
        const supabase = createClient();
        async function fetchProfile() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (user) {
                    setIsLoggedIn(true);
                    const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    if (data) {
                        setProfile(data);

                        // Generate QR Code
                        try {
                            const qr = await QRCode.toDataURL(`MEMBER:${data.id}`, {
                                margin: 1,
                                width: 200,
                                color: {
                                    dark: '#000000',
                                    light: '#ffffff'
                                }
                            });
                            setQrCode(qr);
                        } catch (qrErr) {
                            console.error("QR Generation failed", qrErr);
                        }
                    }
                } else {
                    setIsLoggedIn(false);
                    // Generate a "Guest" QR code for preview
                    const guestQr = await QRCode.toDataURL('https://getxobelaeskola.com/student/membership', {
                        margin: 1,
                        width: 200,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    setQrCode(guestQr);
                }
            } catch (err) {
                console.error("Critical error fetching profile:", err);
            } finally {
                // Ensure loading is always stopped
                setTimeout(() => setLoading(false), 800);
            }
        }
        fetchProfile();
    }, []);

    const handlePrint = () => {
        if (!isSocio) return;
        window.print();
    };

    const isSocio = profile?.status_socio === 'activo';
    const displayProfile = profile || {
        nombre: isLoggedIn ? 'Navegante' : 'Visitante',
        apellidos: isLoggedIn ? '' : 'Invitado',
        id: 'GUEST-PREVIEW-MODE',
        status_socio: 'none'
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-nautical-black">
            <div className="relative">
                <div className="w-24 h-24 border-t-2 border-brass-gold rounded-full animate-spin transition-all duration-1000 ease-in-out opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl animate-pulse">⚓</span>
                </div>
            </div>
            <div className="mt-8 text-brass-gold animate-pulse text-[10px] uppercase tracking-[0.8em] font-black pl-[0.8em]">Autenticando...</div>
        </div>
    );

    return (
        <main className="min-h-screen pt-24 md:pt-32 pb-24 px-6 bg-nautical-black text-white print:pt-0 print:pb-0 print:bg-white print:text-black relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(184,134,11,0.1)_0%,_transparent_50%)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center print:hidden"
                >
                    <h1 className="text-3xl font-display italic mb-3 text-white">
                        {isSocio ? 'Carnet de Socio' : 'Identidad Digital'}
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="h-[1px] w-8 bg-brass-gold/30"></span>
                        <p className="text-brass-gold/60 text-[10px] uppercase tracking-[0.4em] font-black">
                            {isSocio ? 'OFFICIAL MEMBER' : 'PREVIEW ACCESS'}
                        </p>
                        <span className="h-[1px] w-8 bg-brass-gold/30"></span>
                    </div>
                </motion.div>

                {/* Card Container with Tilt */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    ref={cardRef}
                    className="relative aspect-[1.6/1] w-full cursor-none group print:shadow-none print:transform-none"
                >
                    {/* The Card Itself */}
                    <div className={`absolute inset-0 bg-[#111] border ${isSocio ? 'border-brass-gold/40 shadow-[0_0_50px_rgba(184,134,11,0.15)]' : 'border-white/10 opacity-60 grayscale'} rounded-2xl overflow-hidden flex flex-col justify-between p-8 group-hover:border-brass-gold/60 transition-all duration-700 print:border-black print:rounded-none`}>

                        {/* Background Patterns */}
                        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('/images/nautical-pattern.svg')] bg-repeat mix-blend-overlay" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${isSocio ? 'from-brass-gold/15 via-transparent to-accent/5' : 'from-white/5 to-transparent'} pointer-events-none`} />

                        {/* Interactive Shine Effect */}
                        <motion.div
                            style={{
                                background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
                                x: useTransform(x, [-0.5, 0.5], ["-50%", "50%"]),
                                y: useTransform(y, [-0.5, 0.5], ["-50%", "50%"]),
                            }}
                            className="absolute inset-0 pointer-events-none mix-blend-overlay"
                        />

                        {/* Card Header */}
                        <div className="relative z-10 flex justify-between items-start" style={{ transform: "translateZ(50px)" }}>
                            <div>
                                <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${isSocio ? 'text-brass-gold' : 'text-white/30'} mb-1 drop-shadow-sm`}>
                                    {isSocio ? 'GOLD MEMBER' : 'GUEST PASS'}
                                </div>
                                <div className="text-2xl font-display italic text-white leading-none">Getxo Bela <span className={isSocio ? "text-brass-gold" : "text-white/40"}>Eskola</span></div>
                            </div>
                            <div className="w-12 h-12 relative opacity-80 flex justify-end">
                                <span className={`text-4xl ${isSocio ? 'text-brass-gold/20' : 'text-white/10'} group-hover:rotate-12 transition-transform duration-700`}>⚓</span>
                            </div>
                        </div>

                        {/* Card Center Content */}
                        <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
                            <div className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Member Reference ID</div>
                            <div className="text-lg font-mono tracking-[0.2em] text-white/90 mb-6 flex gap-2">
                                <span className={isSocio ? "text-brass-gold" : "text-white/30"}>GB</span>
                                <span>{displayProfile.id.slice(0, 4).toUpperCase()}</span>
                                <span className="text-white/20">—</span>
                                <span>{displayProfile.id.slice(4, 8).toUpperCase()}</span>
                            </div>

                            <div className={`text-[8px] uppercase tracking-[0.4em] ${isSocio ? 'text-brass-gold/60' : 'text-white/20'} mb-2 font-black`}>Licensed Skipper</div>
                            <div className="text-2xl font-display italic text-white uppercase tracking-tight break-words">
                                {displayProfile.nombre} {displayProfile.apellidos}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-6" style={{ transform: "translateZ(30px)" }}>
                            <div className="flex gap-8">
                                <div>
                                    <div className="text-[7px] uppercase tracking-[0.2em] text-white/30 mb-1">Status</div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isSocio ? 'text-green-500' : 'text-orange-500'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isSocio ? 'bg-green-500' : 'bg-orange-500'}`} />
                                        {isSocio ? 'Verified' : 'Inactive'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[7px] uppercase tracking-[0.2em] text-white/30 mb-1">Valid Thru</div>
                                    <div className="text-[10px] font-black text-white/80 uppercase">
                                        {profile?.fecha_fin_periodo ? new Date(profile.fecha_fin_periodo).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' }).toUpperCase() : (isSocio ? 'NEVER' : '---')}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-1 rounded-sm shadow-xl hover:scale-110 transition-transform duration-500 cursor-zoom-in">
                                {qrCode && (
                                    <Image src={qrCode} alt="Member QR" width={48} height={48} className={isSocio ? "grayscale-0" : "grayscale opacity-50"} />
                                )}
                            </div>
                        </div>

                        {/* Locked/inactive Overlay */}
                        {!isSocio && (
                            <div className="absolute inset-0 bg-nautical-black/40 backdrop-blur-[2px] flex items-center justify-center z-50">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-nautical-black/80 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center max-w-[80%]"
                                >
                                    {isLoggedIn ? (
                                        <>
                                            <ShieldAlert className="w-8 h-8 text-orange-500 mb-2" />
                                            <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Membresía Inactiva</div>
                                            <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">Necesitas activar tu suscripción de socio para usar este carnet.</p>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-8 h-8 text-brass-gold mb-2" />
                                            <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Acceso Restringido</div>
                                            <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">Inicia sesión para ver tu carnet oficial de Getxo Bela.</p>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Mobile/Digital Buttons */}
                <div className="mt-12 flex flex-col gap-4 print:hidden">
                    {!isLoggedIn ? (
                        <Link
                            href={`/${locale}/auth/login?returnTo=/${locale}/student/membership/card`}
                            className="py-5 bg-white text-nautical-black text-[10px] uppercase tracking-[0.3em] font-black hover:bg-brass-gold transition-all flex items-center justify-center gap-3 group"
                        >
                            <LogIn className="w-4 h-4" /> Iniciar Sesión para Identificarse
                        </Link>
                    ) : !isSocio ? (
                        <Link
                            href={`/${locale}/student/membership`}
                            className="py-5 bg-brass-gold text-nautical-black text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white hover:shadow-[0_0_40px_rgba(184,134,11,0.5)] transition-all flex items-center justify-center gap-3 group"
                        >
                            Activar Membresía de Socio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handlePrint}
                                className="py-4 bg-[#111] border border-white/5 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-3 group"
                            >
                                <span className="text-lg group-hover:scale-110 transition-transform">🖨️</span> {locale === 'es' ? 'Imprimir Físico' : 'Print Card'}
                            </button>
                            <Link
                                href={`/${locale}/student/dashboard`}
                                className="py-4 bg-brass-gold text-nautical-black text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white hover:shadow-[0_0_30px_rgba(184,134,11,0.4)] transition-all flex items-center justify-center gap-2 group"
                            >
                                {locale === 'es' ? 'Dashboard' : 'Done'} <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    )}

                    {isLoggedIn && !isSocio && (
                        <Link
                            href={`/${locale}/student/dashboard`}
                            className="py-3 text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold text-center hover:text-white transition-colors"
                        >
                            Volver al Dashboard
                        </Link>
                    )}
                </div>

                {/* Benefits List Tooltip-style */}
                <AnimatePresence>
                    {isSocio && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 print:hidden backdrop-blur-sm"
                        >
                            <h3 className="text-[10px] font-black text-brass-gold uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-brass-gold/30"></span>
                                BENEFICIOS ACTIVOS
                                <span className="w-6 h-[1px] bg-brass-gold/30"></span>
                            </h3>
                            <ul className="space-y-4 text-xs font-light">
                                <li className="flex items-start gap-4 group">
                                    <span className="text-brass-gold group-hover:scale-125 transition-transform mt-0.5">⭐</span>
                                    <div>
                                        <p className="text-white font-medium mb-0.5">Tarifa Plana de Alquiler</p>
                                        <p className="text-white/40 text-[11px]">15% de descuento en toda la flota de Getxo.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group">
                                    <span className="text-brass-gold group-hover:scale-125 transition-transform mt-0.5">⚓</span>
                                    <div>
                                        <p className="text-white font-medium mb-0.5">Reserva Anticipada VIP</p>
                                        <p className="text-white/40 text-[11px]">Prioridad en travesías nocturnas y eventos del club.</p>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                @media print {
                    nav, footer, .print-hide, aside, header { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    main { padding: 0 !important; min-height: 0 !important; }
                    .max-w-md { max-width: 100% !important; margin: 0 !important; }
                }
            `}</style>
        </main>
    );
}
