
'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { getApiUrl } from '@/lib/platform';

interface TipoBono {
    id: string;
    nombre: string;
    descripcion: string;
    horas_totales: number;
    precio: number;
    categorias_validas: string[];
}

export default function BonoPurchaseModal({
    isOpen,
    onClose,
    locale
}: {
    isOpen: boolean;
    onClose: () => void;
    locale: string;
}) {
    const [bonos, setBonos] = useState<TipoBono[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetch(getApiUrl('/api/bonos'))
                .then(res => res.json())
                .then(data => {
                    setBonos(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching bonos:', err);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    const handlePurchase = async (bonoId: string) => {
        setPurchasingId(bonoId);
        try {
            const res = await fetch(getApiUrl('/api/checkout/bono'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bonoId, locale })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Checkout failed');
            }
        } catch (err) {
            console.error('Purchase error:', err);
            alert('Error al iniciar la compra. Por favor, inténtalo de nuevo.');
        } finally {
            setPurchasingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-nautical-black/90 backdrop-blur-md">
            <div className="bg-gradient-to-b from-[#0a1628] to-nautical-black border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-sm flex flex-col relative shadow-2xl">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                <div className="p-8 md:p-12 overflow-y-auto">
                    <header className="mb-12">
                        <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Packs de Navegación</span>
                        <h2 className="text-4xl md:text-5xl font-display italic text-white leading-none">Bonos de Horas</h2>
                        <p className="text-white/40 mt-4 max-w-xl font-light">
                            Navega más por menos. Adquiere un pack de horas y úsalo de forma flexible en cualquier reserva de alquiler.
                        </p>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-accent/40">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Cargando Packs...</span>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bonos.map((bono) => (
                                <div key={bono.id} className="bg-white/5 border border-white/5 p-8 flex flex-col group hover:border-accent/30 transition-all hover:bg-white/[0.07]">
                                    <div className="mb-8">
                                        <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent mb-6 rounded-sm">
                                            <Zap size={18} />
                                        </div>
                                        <h3 className="text-2xl font-display italic text-white mb-2 leading-none group-hover:text-accent transition-colors">
                                            {bono.nombre}
                                        </h3>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                                            {bono.horas_totales} Horas de Navegación
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-white/5">
                                        <div className="flex items-baseline gap-2 mb-8">
                                            <span className="text-4xl font-black text-white italic tracking-tighter">{bono.precio}€</span>
                                            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Iva Inc.</span>
                                        </div>

                                        <button
                                            disabled={!!purchasingId}
                                            onClick={() => handlePurchase(bono.id)}
                                            className="w-full py-4 bg-accent text-nautical-black font-black uppercase tracking-[0.2em] text-[10px] rounded-sm hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                        >
                                            {purchasingId === bono.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    Comprar Ahora
                                                    <ChevronRight size={14} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="p-8 border-t border-white/5 flex justify-center bg-white/[0.02]">
                    <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-white/20 font-bold">
                        <Sparkles size={12} className="text-accent" />
                        Los bonos tienen una validez de 1 año desde la fecha de compra
                    </div>
                </footer>
            </div>
        </div>
    );
}
