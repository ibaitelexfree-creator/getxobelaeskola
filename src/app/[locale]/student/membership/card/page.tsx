'use client';
import React, { useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MembershipCardPage({ params: { locale } }: { params: { locale: string } }) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const supabase = createClient();
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(data);
            }
            setLoading(false);
        }
        fetchProfile();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-nautical-black text-white">Cargando carnet...</div>;
    if (!profile || profile.status_socio !== 'activo') {
        return <div className="min-h-screen flex items-center justify-center bg-nautical-black text-white">No tienes una membresía activa.</div>;
    }

    return (
        <main className="min-h-screen pt-32 pb-24 px-6 bg-nautical-black text-white print:pt-0 print:pb-0 print:bg-white print:text-black">
            <div className="max-w-md mx-auto">
                <div className="mb-8 text-center print:hidden">
                    <h1 className="text-2xl font-display italic mb-2">Tu Carnet de Socio</h1>
                    <p className="text-white/40 text-xs uppercase tracking-widest">Digital & Imprimible</p>
                </div>

                {/* Card Design */}
                <div
                    ref={cardRef}
                    className="relative aspect-[1.6/1] w-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl border border-brass-gold/30 shadow-2xl overflow-hidden p-8 flex flex-col justify-between group print:shadow-none print:border-black print:rounded-none"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brass-gold/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brass-gold mb-1">Membresía Oficial</div>
                            <div className="text-xl font-display italic text-white print:text-black">Getxo Bela Eskola</div>
                        </div>
                        <div className="text-3xl text-brass-gold/40">⚓</div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="text-[8px] uppercase tracking-widest text-white/40 mb-1 print:text-black/40">Socio Nº</div>
                        <div className="text-lg font-mono tracking-tighter text-white mb-4 print:text-black">
                            GB-{profile.id.slice(0, 8).toUpperCase()}
                        </div>

                        <div className="text-[8px] uppercase tracking-widest text-white/40 mb-1 print:text-black/40">Nombre del Titular</div>
                        <div className="text-xl font-display italic text-white uppercase print:text-black">
                            {profile.nombre} {profile.apellidos}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-end border-t border-white/10 pt-4 print:border-black/20">
                        <div>
                            <div className="text-[7px] uppercase tracking-widest text-white/30 print:text-black/30">Válido hasta</div>
                            <div className="text-xs font-bold text-accent">
                                {profile.fecha_fin_periodo ? new Date(profile.fecha_fin_periodo).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                        <div className="bg-white p-1 rounded-sm">
                            {/* Simple QR Placeholder (could use a library later) */}
                            <div className="w-8 h-8 bg-black"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="py-3 bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        🖨️ Imprimir
                    </button>
                    <Link
                        href={`/${locale}/student/dashboard`}
                        className="py-3 bg-accent text-nautical-black text-[10px] uppercase tracking-widest font-black hover:bg-white transition-all flex items-center justify-center shadow-lg shadow-accent/10"
                    >
                        Volver →
                    </Link>
                </div>

                <div className="mt-12 p-6 rounded-lg bg-card border border-white/5 print:hidden">
                    <h3 className="text-xs font-bold text-brass-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span>🛡️</span> Ventajas del Socio
                    </h3>
                    <ul className="space-y-3 text-[11px] text-white/60 font-light">
                        <li className="flex items-center gap-2">• <span className="text-white">Descuento Directo:</span> 15% en todos los alquileres de material.</li>
                        <li className="flex items-center gap-2">• <span className="text-white">Alquiler VIP:</span> Reserva de material con solo 2h de antelación.</li>
                        <li className="flex items-center gap-2">• <span className="text-white">Eventos:</span> Acceso preferente a travesías del club.</li>
                    </ul>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    nav, footer, .print-hide { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>
        </main>
    );
}
