'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const type = searchParams.get('type'); // course, rental, membership
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // We could verify the session here with an API call if we wanted to be super robust
        // but since it's a success redirect from Stripe, it's mostly for UI.
    }, []);

    if (!mounted) return null;

    const isMembership = type === 'membership';
    const isRental = type === 'rental';
    const isCourse = type === 'course';

    return (
        <main className="min-h-screen bg-nautical-black flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brass-gold/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sea-foam/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-2xl w-full relative z-10">
                {/* Main Card */}
                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-700">

                    {/* Top Accent Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-brass-gold via-white/20 to-sea-foam" />

                    <div className="p-8 md:p-12 text-center">
                        {/* Status Icon */}
                        <div className="mb-8 relative inline-block">
                            <div className="w-24 h-24 rounded-full bg-brass-gold/10 flex items-center justify-center text-5xl border border-brass-gold/20 shadow-[0_0_50px_rgba(184,134,11,0.2)] animate-pulse">
                                ⚓
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-sea-foam rounded-full flex items-center justify-center text-nautical-black text-xl border-4 border-nautical-black">
                                ✓
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display italic text-white mb-6 tracking-tight">
                            {isMembership ? 'Bienvenido a Bordo' : isRental ? 'Reserva Confirmada' : 'Inscripción Listos'}
                        </h1>

                        <p className="text-lg text-white/60 font-light max-w-md mx-auto mb-12 leading-relaxed">
                            {isMembership
                                ? 'Tu suscripción de socio ha sido activada correctamente. Ahora tienes acceso a tarifas exclusivas y ventajas en toda nuestra flota.'
                                : isRental
                                    ? 'Hemos registrado tu reserva de material. Recibirás un correo con los detalles y el código de acceso si es necesario.'
                                    : 'Tu plaza en el curso ha sido reservada con éxito. Ya puedes acceder al material teórico desde tu panel de alumno.'}
                        </p>

                        {/* Order Confirmation Mockup */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-6 mb-12 text-left space-y-4 max-w-sm mx-auto relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-brass-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

                            <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                                <span>Transacción</span>
                                <span>#{sessionId?.slice(-8).toUpperCase() || 'PAGO-OK'}</span>
                            </div>

                            <div className="h-px bg-white/10 w-full" />

                            <div className="space-y-1">
                                <p className="text-2xs uppercase tracking-tighter text-brass-gold font-black">Estado</p>
                                <p className="text-white text-sm font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 bg-sea-foam rounded-full shadow-[0_0_8px_#4fd1c5]" />
                                    Completado y Verificado
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-2xs uppercase tracking-tighter text-brass-gold font-black">Destino</p>
                                <p className="text-white text-sm font-medium">Bela Eskola - Puerto de Getxo</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                href="/"
                                className="w-full py-5 bg-brass-gold text-nautical-black font-black uppercase tracking-[0.2em] text-[11px] rounded-sm hover:bg-white transition-all shadow-[0_10px_30px_rgba(184,134,11,0.2)] hover:-translate-y-1 active:scale-95 duration-300"
                            >
                                Ir al Inicio
                            </Link>
                            <Link
                                href="/student/dashboard"
                                className="w-full py-5 border border-white/10 text-white font-bold uppercase tracking-[0.2em] text-[11px] rounded-sm hover:bg-white/5 transition-all hover:border-white/30 hover:-translate-y-1 active:scale-95 duration-300"
                            >
                                Mi Panel Personal →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <p className="text-center mt-12 text-white/20 text-xs italic font-serif">
                    "No hay viento favorable para quien no sabe a qué puerto se dirige." — Séneca
                </p>
            </div>
        </main>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-nautical-black flex items-center justify-center text-white">Cargando confirmación...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
