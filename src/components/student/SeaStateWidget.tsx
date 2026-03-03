'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Timer, Wind, RefreshCw, Clock, Droplets, Info } from 'lucide-react';

interface SeaStateData {
    wave_height: number;
    wave_period: number;
    water_temp: number;
    wind_speed: number;
    wind_direction: number;
    timestamp: string;
}

interface SeaStateWidgetProps {
    translations?: any;
    locale?: string;
}

export default function SeaStateWidget({ translations, locale = 'es' }: SeaStateWidgetProps) {
    const t = translations?.sea_state || {
        title: "Estado del Mar",
        subtitle: "Condiciones Actuales en Getxo",
        wave_height: "Altura Ola",
        wave_period: "Período",
        water_temp: "Temp. Agua",
        wind_speed: "Vel. Viento",
        wind_dir: "Dir. Viento",
        last_update: "Última actualización: {time}",
        source: "Fuente: Puertos del Estado"
    };

    const [data, setData] = useState<SeaStateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/sea-state');
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setError(false);
            } else {
                setError(true);
            }
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30 * 60 * 1000); // 30 minutes
        return () => clearInterval(interval);
    }, []);

    const formatTime = (isoString: string) => {
        if (!isoString) return '--:--';
        try {
            return new Date(isoString).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '--:--';
        }
    };

    if (loading) {
        return (
             <div className="bg-gradient-to-br from-[#0a1628] to-[#010816] border border-white/5 rounded-sm p-8 h-64 flex items-center justify-center animate-pulse mb-12">
                <div className="flex items-center gap-3 text-accent/40 text-xs uppercase tracking-widest font-black">
                    <RefreshCw className="animate-spin" size={14} />
                    {t.title}...
                </div>
            </div>
        );
    }

    if (error || !data) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#0a1628] to-[#010816] border border-accent/20 rounded-sm p-6 lg:p-8 relative overflow-hidden group hover:border-accent/40 transition-all mb-12"
        >
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Waves size={140} />
            </div>

            <header className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Waves size={16} />
                        </div>
                        <h3 className="text-lg font-display text-white italic">{t.title}</h3>
                    </div>
                    <p className="text-white/40 text-xs uppercase tracking-widest pl-11">{t.subtitle}</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isRefreshing}
                    className={`p-2 hover:bg-white/5 rounded-full transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={14} className="text-white/20 hover:text-accent" />
                </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 relative z-10">
                {/* Wave Height */}
                <div className="bg-[#050c18] border border-white/5 p-4 rounded-sm hover:border-accent/20 transition-all group/item">
                    <div className="flex items-center gap-2 mb-3 text-white/40 group-hover/item:text-accent transition-colors">
                        <Waves size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-black">{t.wave_height}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display text-white italic">{data.wave_height}</span>
                        <span className="text-xs text-white/40 font-bold">m</span>
                    </div>
                </div>

                {/* Period */}
                <div className="bg-[#050c18] border border-white/5 p-4 rounded-sm hover:border-accent/20 transition-all group/item">
                    <div className="flex items-center gap-2 mb-3 text-white/40 group-hover/item:text-accent transition-colors">
                        <Timer size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-black">{t.wave_period}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display text-white italic">{data.wave_period}</span>
                        <span className="text-xs text-white/40 font-bold">s</span>
                    </div>
                </div>

                {/* Water Temp */}
                <div className="bg-[#050c18] border border-white/5 p-4 rounded-sm hover:border-accent/20 transition-all group/item">
                    <div className="flex items-center gap-2 mb-3 text-white/40 group-hover/item:text-sea-foam transition-colors">
                        <Droplets size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-black">{t.water_temp}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display text-white italic">{data.water_temp}</span>
                        <span className="text-xs text-white/40 font-bold">°C</span>
                    </div>
                </div>

                {/* Wind */}
                 <div className="bg-[#050c18] border border-white/5 p-4 rounded-sm hover:border-accent/20 transition-all group/item">
                    <div className="flex items-center gap-2 mb-3 text-white/40 group-hover/item:text-brass-gold transition-colors">
                        <Wind size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-black">{t.wind_speed}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display text-white italic">{data.wind_speed}</span>
                        <span className="text-xs text-white/40 font-bold">kn</span>
                    </div>
                     <div className="mt-2 flex items-center gap-2 text-[9px] text-white/30 font-mono">
                        <div style={{ transform: `rotate(${data.wind_direction}deg)` }}>
                            <Wind size={10} />
                        </div>
                        {data.wind_direction}°
                    </div>
                </div>
            </div>

             <footer className="mt-6 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/30">
                    <Clock size={10} />
                    {t.last_update.replace('{time}', formatTime(data.timestamp))}
                </div>
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/30">
                     <Info size={10} />
                     {t.source}
                </div>
            </footer>
        </motion.div>
    );
}
