'use client';

import React from 'react';
import { Award, Lock, Star } from 'lucide-react';

interface LogroItem {
    logro: {
        id: string;
        nombre_es: string;
        nombre_eu: string;
        descripcion_es: string;
        descripcion_eu: string;
        icono: string;
        puntos: number;
        rareza: string;
    };
    fecha_obtencion: string;
}

interface AchievementsWidgetProps {
    logros: LogroItem[];
    locale: string;
}

export default function AchievementsWidget({ logros, locale }: AchievementsWidgetProps) {
    // Sort by most recent first
    const sortedLogros = [...logros].sort((a, b) =>
        new Date(b.fecha_obtencion).getTime() - new Date(a.fecha_obtencion).getTime()
    );

    // Limit to 9 for the widget display
    const visibleLogros = sortedLogros.slice(0, 9);

    // Calculate total points
    const totalPoints = logros.reduce((acc, curr) => acc + curr.logro.puntos, 0);

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                        <Award size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white italic">Logros</h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest">
                            {logros.length} Desbloqueados
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-amber-500">{totalPoints}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold">XP TOTAL</div>
                </div>
            </div>

            {logros.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                    {visibleLogros.map((item) => (
                        <div
                            key={item.logro.id}
                            className="group relative aspect-square bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/30 rounded-2xl flex flex-col items-center justify-center transition-all cursor-help"
                        >
                            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                                {item.logro.icono || '🏆'}
                            </div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/30 group-hover:text-amber-500/80 transition-colors">
                                {item.logro.puntos} XP
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0a1628] border border-white/10 p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded ${item.logro.rareza === 'legendario' ? 'bg-purple-500/20 text-purple-400' :
                                            item.logro.rareza === 'epico' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {item.logro.rareza}
                                    </span>
                                    <span className="text-[8px] text-white/30">{new Date(item.fecha_obtencion).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-xs font-bold text-white mb-1">
                                    {locale === 'eu' ? item.logro.nombre_eu : item.logro.nombre_es}
                                </h4>
                                <p className="text-[10px] text-white/50 leading-tight">
                                    {locale === 'eu' ? item.logro.descripcion_eu : item.logro.descripcion_es}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder for empty slots to maintain grid shape if few achievements */}
                    {Array.from({ length: Math.max(0, 9 - visibleLogros.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-white/[0.01] border border-dashed border-white/5 rounded-2xl flex items-center justify-center opacity-30">
                            <Lock size={16} className="text-white/10" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    <Lock className="mx-auto text-white/10 mb-3" size={24} />
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Sin Logros Aún</p>
                    <p className="text-white/20 text-[10px] max-w-[150px] mx-auto mt-1">Completa desafíos para desbloquear medallas.</p>
                </div>
            )}

            <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-2">
                Ver todos los logros <Star size={12} />
            </button>
        </div>
    );
}
