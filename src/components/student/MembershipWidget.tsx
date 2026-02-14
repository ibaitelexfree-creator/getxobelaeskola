'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface MembershipWidgetProps {
    status: string;
    locale: string;
}

export default function MembershipWidget({ status, locale }: MembershipWidgetProps) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/membership/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale })
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

    if (status === 'activo') return null;

    return (
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-brass-gold/20 to-brass-gold/5 p-8 border border-brass-gold/30 rounded-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none group-hover:scale-110 transition-transform duration-700">⚓</div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-display italic text-white mb-2 underline decoration-brass-gold/40">Hazte Socio del Club</h3>
                        <p className="text-white/70 text-sm max-w-md">
                            Únete a la comunidad de navegantes de Getxo Bela. Por solo <span className="text-brass-gold font-bold">20€/mes</span> tendrás descuentos en alquileres, prioridad en cursos y eventos exclusivos.
                        </p>
                    </div>

                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="px-10 py-4 bg-brass-gold text-nautical-black font-black uppercase tracking-widest text-xs rounded hover:bg-white transition-all shadow-[0_0_30px_rgba(184,134,11,0.2)] whitespace-nowrap"
                    >
                        {loading ? 'Preparando...' : 'Unirme Ahora →'}
                    </button>
                </div>
            </div>
        </section>
    );
}
