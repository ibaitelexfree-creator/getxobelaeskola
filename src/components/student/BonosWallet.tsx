
import React from 'react';
import { Sparkles, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Bono {
    id: string;
    horas_iniciales: number;
    horas_restantes: number;
    fecha_expiracion: string;
    tipos_bono?: {
        nombre: string;
        descripcion?: string;
    };
}

export default function BonosWallet({
    bonos,
    locale,
    onBuyClick
}: {
    bonos: Bono[],
    locale: string,
    onBuyClick?: () => void
}) {
    if (!bonos || bonos.length === 0) {
        return (
            <div className="bg-card/50 border border-white/5 rounded-sm p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white/40" />
                </div>
                <div>
                    <h3 className="text-white font-display text-lg mb-1">Sin Bonos Activos</h3>
                    <p className="text-white/40 text-sm max-w-[250px]">
                        Adquiere un pack de horas para navegar con descuento y flexibilidad.
                    </p>
                </div>
                <button
                    onClick={onBuyClick}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs uppercase tracking-widest font-bold rounded-sm transition-colors border border-white/5"
                >
                    Ver Packs Disponibles
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <h2 className="text-xs uppercase tracking-widest text-accent font-bold">Mis Bonos Activos</h2>
                <Link href={`/${locale}/bonos/history`} className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-accent transition-colors">
                    Ver Historial
                </Link>
            </div>

            <div className="grid gap-4">
                {bonos.map((bono) => {
                    const percentage = Math.min(100, (bono.horas_restantes / bono.horas_iniciales) * 100);
                    const isLow = percentage < 20;

                    return (
                        <div key={bono.id} className="bg-gradient-to-br from-card to-card/50 border border-white/10 p-5 rounded-sm relative overflow-hidden group hover:border-accent/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                                <Sparkles size={60} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-white font-display text-xl italic">{bono.tipos_bono?.nombre || 'Bono General'}</h3>
                                        <p className="text-white/40 text-xs mt-1">Válido hasta {new Date(bono.fecha_expiracion).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white leading-none">{bono.horas_restantes}h</div>
                                        <div className="text-[9px] uppercase tracking-widest text-accent/60 mt-1">Disponibles</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${isLow ? 'bg-red-500' : 'bg-accent'} transition-all duration-1000 ease-out`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                        <span>{percentage.toFixed(0)}% Restante</span>
                                        <span>Total: {bono.horas_iniciales}h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
