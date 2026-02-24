
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Thermometer, Wind, Navigation, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SeaStateData {
    waveHeight: number;
    period: number;
    waterTemp: number;
    windSpeed: number;
    windDirection: number;
    timestamp: string;
    isSimulated: boolean;
}

export default function SeaStateWidget() {
    // Try to use translations, fallback to null if context missing (though it should be there)
    let t: any;
    try {
        t = useTranslations('sea_state_widget');
    } catch (e) {
        // Fallback for development if keys missing or context unavailable
        t = (key: string) => {
            const defaults: Record<string, string> = {
                title: 'Estado del Mar',
                subtitle: 'Boya Bilbao-Vizcaya (Getxo)',
                wave_height: 'Altura Ola',
                period: 'Período',
                water_temp: 'Temp. Agua',
                wind_speed: 'Viento',
                simulated: 'Simulado',
                simulated_desc: 'Datos estimados por modelo',
                real_time: 'Tiempo Real',
                meters: 'm',
                seconds: 's',
                celsius: '°C',
                knots: 'kn'
            };
            return defaults[key] || key;
        };
    }

    const [data, setData] = useState<SeaStateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/weather');
            const json = await res.json();
            if (json.seaState) {
                setData(json.seaState);
            }
        } catch (e) {
            console.error('Failed to fetch sea state', e);
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

    if (loading) {
        return (
            <div className="bg-[#050c18] border border-white/5 rounded-sm p-8 h-48 flex items-center justify-center animate-pulse">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-accent/40" size={20} />
                    <span className="text-white/20 text-[10px] uppercase tracking-widest">{t('loading') || 'Cargando...'}</span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#0a1628] to-[#010816] border border-white/5 rounded-sm p-8 relative overflow-hidden group hover:border-blue-500/20 transition-all mb-12"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Waves size={180} />
            </div>

            <header className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <span className="text-blue-400 uppercase tracking-[0.3em] text-[10px] font-black block mb-2">
                        {t('title')}
                    </span>
                    <h3 className="text-white text-xl font-display italic">
                        {t('subtitle')}
                    </h3>
                    <p className="text-white/40 text-xs mt-1 font-light flex items-center gap-2">
                        {data.isSimulated ? (
                            <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20">
                                <AlertTriangle size={10} />
                                <span className="uppercase tracking-wider text-[9px] font-bold">{t('simulated')}</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-0.5 rounded-sm border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="uppercase tracking-wider text-[9px] font-bold">{t('real_time')}</span>
                            </span>
                        )}
                        <span className="opacity-50">{new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors group/refresh"
                >
                    <RefreshCw size={16} className={`text-white/20 group-hover/refresh:text-blue-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                {/* Wave Height */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                        <Waves size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-bold">{t('wave_height')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display text-white italic tracking-tighter">{data.waveHeight}</span>
                        <span className="text-xs text-white/40 font-bold">{t('meters')}</span>
                    </div>
                    {/* Visual bar */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (data.waveHeight / 5) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                </div>

                {/* Period */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                        <Clock size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-bold">{t('period')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display text-white italic tracking-tighter">{data.period}</span>
                        <span className="text-xs text-white/40 font-bold">{t('seconds')}</span>
                    </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (data.period / 15) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-cyan-400"
                        />
                    </div>
                </div>

                {/* Water Temp */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                        <Thermometer size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-bold">{t('water_temp')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display text-white italic tracking-tighter">{data.waterTemp}</span>
                        <span className="text-xs text-white/40 font-bold">{t('celsius')}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((data.waterTemp - 10) / 15) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full bg-emerald-400"
                        />
                    </div>
                </div>

                 {/* Wind (Context) */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                        <Wind size={14} />
                        <span className="text-[9px] uppercase tracking-widest font-bold">{t('wind_speed')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display text-white italic tracking-tighter">{data.windSpeed}</span>
                        <span className="text-xs text-white/40 font-bold">{t('knots')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                         <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Navigation size={12} className="text-white/60" style={{ transform: `rotate(${data.windDirection}deg)` }} />
                         </div>
                         <span className="text-[10px] text-white/40 font-mono">{data.windDirection}°</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
