
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Gauge, Navigation, Thermometer, Anchor, LifeBuoy, Map, Info, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface WeatherData {
    station: string;
    knots: number;
    kmh: number;
    direction: number;
    temp: number;
    timestamp: string;
    gusts?: number;
}

interface WeatherPremiumProps {
    refreshInterval?: number;
}

export default function WeatherPremium({ refreshInterval = 600000 }: WeatherPremiumProps) {
    const [data, setData] = useState<{
        weather: WeatherData;
        fleet: { agua: number; retorno: number; pendiente: number };
        alerts?: any[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/weather');
            const json = await res.json();
            if (json.weather) {
                setData(json);
                setError(false);
            } else {
                setError(true);
            }
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    if (loading) {
        return (
            <div className="bg-[#050c18] border border-white/5 rounded-sm p-4 animate-pulse h-64 flex items-center justify-center">
                <div className="text-accent/40 text-xs uppercase tracking-widest font-black animate-bounce flex items-center gap-3">
                    <RefreshCw className="animate-spin" size={14} />
                    Sincronizando Estación...
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-[#050c18] border border-red-500/20 rounded-sm p-8 text-center space-y-4">
                <Info className="text-red-500 mx-auto" size={32} />
                <p className="text-white/60 text-xs uppercase tracking-widest">Error de Sincronización Meteorológica</p>
                <button onClick={fetchData} className="px-4 py-2 bg-white/5 text-[10px] uppercase font-black tracking-widest hover:bg-white/10 transition-all rounded-full">Reintentar</button>
            </div>
        );
    }

    const { weather, fleet, alerts } = data;

    return (
        <div className="space-y-6">
            {/* ALERTAS OFICIALES EUSKALMET */}
            <AnimatePresence>
                {alerts && alerts.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-500/10 border border-red-500/50 rounded-sm p-4 flex flex-col md:flex-row items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse flex-shrink-0">
                                <Info size={20} />
                            </div>
                            <div className="flex-1">
                                <h5 className="text-red-500 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Avisos Oficiales Euskalmet</h5>
                                <div className="flex flex-wrap gap-x-4">
                                    {alerts.map((alert, i) => (
                                        <p key={i} className="text-white text-xs font-medium">
                                            <span className="text-red-400 font-bold capitalize">{alert.level}:</span> {alert.phenomenon || 'Condiciones adversas'}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Link
                            href="https://www.euskalmet.euskadi.eus/avisos/avisos-meteorologicos-oficiales/"
                            target="_blank"
                            className="w-full md:w-auto text-center text-[9px] uppercase font-black tracking-widest py-2.5 px-6 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                        >
                            Ver Detalles
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* WIND GAUGE - PREMIUM */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#0a1628] to-[#010816] border border-accent/20 rounded-sm p-8 relative overflow-hidden group shadow-2xl hover:border-accent/40 transition-all"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                        <Wind size={120} />
                    </div>

                    <header className="flex justify-between items-center mb-6">
                        <div>
                            <span className="text-accent uppercase tracking-[0.3em] text-[10px] font-black block mb-1">Viento Hoy</span>
                            <h4 className="text-white/40 text-[9px] uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                {weather.station}
                            </h4>
                        </div>
                        <button onClick={fetchData} disabled={isRefreshing}>
                            <RefreshCw size={14} className={`text-white/20 hover:text-accent transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </header>

                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="74" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                <motion.circle
                                    cx="80"
                                    cy="80"
                                    r="74"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={465}
                                    initial={{ strokeDashoffset: 465 }}
                                    animate={{ strokeDashoffset: 465 - (465 * Math.min(weather.knots, 40)) / 40 }}
                                    className="text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)] transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-display text-white italic tracking-tighter transition-all group-hover:scale-110">{weather.knots}</span>
                                <span className="text-xs uppercase tracking-[0.3em] text-accent font-black">NUDOS</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center space-y-1">
                            <p className="text-lg text-white font-display italic">{weather.kmh} <span className="text-white/40 text-xs">km/h</span></p>
                            <div className="flex items-center gap-4 py-2 px-6 bg-white/5 rounded-full border border-white/5">
                                <span className="flex items-center gap-1.5 text-brass-gold text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-4">
                                    <Navigation size={10} style={{ transform: `rotate(${weather.direction}deg)` }} />
                                    {weather.direction}°
                                </span>
                                <span className="flex items-center gap-1.5 text-sea-foam text-[10px] font-black uppercase tracking-widest pl-2">
                                    <Thermometer size={10} />
                                    {weather.temp}°C
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* MONITOR FLOTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#0a1628] to-[#010816] border border-white/5 rounded-sm p-8 relative overflow-hidden flex flex-col justify-between hover:border-accent/20 transition-all"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <LifeBuoy size={100} />
                    </div>

                    <header className="mb-8">
                        <span className="text-accent uppercase tracking-[0.3em] text-[10px] font-black block mb-4">Monitor Flota</span>
                        <p className="text-white/40 text-xs leading-relaxed max-w-[180px]">Estado operacional de embarcaciones en tiempo real.</p>
                    </header>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:translate-x-1 transition-transform group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shadow-glow">
                                    <Anchor size={14} />
                                </div>
                                <span className="text-xs uppercase tracking-widest font-bold text-white/80 group-hover:text-white">En Agua</span>
                            </div>
                            <span className="text-2xl font-display text-white italic">{fleet.agua}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:translate-x-1 transition-transform group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-brass-gold/10 flex items-center justify-center text-brass-gold">
                                    <RefreshCw size={14} />
                                </div>
                                <span className="text-xs uppercase tracking-widest font-bold text-white/80 group-hover:text-white">Retorno</span>
                            </div>
                            <span className="text-2xl font-display text-white italic">{fleet.retorno}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-accent/30 rounded-sm hover:translate-x-1 transition-transform group shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent animate-pulse">
                                    <Gauge size={14} />
                                </div>
                                <span className="text-xs uppercase tracking-widest font-black text-accent drop-shadow-sm">Pendientes</span>
                            </div>
                            <span className="text-2xl font-display text-accent italic shadow-glow">{fleet.pendiente}</span>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-2">
                        <Link href="/staff/activity" className="text-[9px] uppercase tracking-widest text-accent font-black hover:underline underline-offset-4">
                            Gestionar Operaciones →
                        </Link>
                    </div>
                </motion.div>

                {/* RADAR & WINDGURU */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#0a1628] to-[#010816] border border-white/5 rounded-sm p-8 relative overflow-hidden flex flex-col hover:border-sea-foam/20 transition-all"
                >
                    <div className="absolute bottom-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                        <Map size={120} />
                    </div>

                    <div className="space-y-8 h-full flex flex-col">
                        <section>
                            <h3 className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black mb-6">Nota Meteorológica</h3>
                            <div className="bg-white/5 border border-white/5 p-6 rounded-sm relative">
                                <div className="absolute top-4 right-4 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-sea-foam/40" />
                                </div>
                                <p className="text-[10px] font-black uppercase text-accent mb-3 tracking-widest">
                                    {alerts && alerts.length > 0 ? 'AVISOS ACTIVOS' : 'CONDICIONES ACTUALES'}
                                </p>
                                <ul className="space-y-2">
                                    {alerts && alerts.length > 0 ? (
                                        alerts.map((alert: any, i: number) => (
                                            <li key={i} className="text-xs text-red-400 font-mono tracking-tight flex items-center gap-2">
                                                <div className="w-1 h-1 bg-red-400 rounded-full" />
                                                {alert.level?.toUpperCase()}: {alert.phenomenon || 'Meteorología adversa'}
                                            </li>
                                        ))
                                    ) : (
                                        <>
                                            <li className="text-xs text-white/50 font-mono tracking-tight flex items-center gap-2">
                                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                                Viento: {weather.knots} kts ({weather.station})
                                            </li>
                                            <li className="text-xs text-white/50 font-mono tracking-tight flex items-center gap-2">
                                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                                Rafagas: {weather.gusts || 0} kts
                                            </li>
                                            <li className="text-xs text-white/50 font-mono tracking-tight flex items-center gap-2">
                                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                                Temp: {weather.temp}°C
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </section>

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <button className="w-full flex items-center justify-between p-4 bg-sea-foam/10 border border-sea-foam/30 rounded-sm group hover:bg-sea-foam/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <Map className="text-sea-foam group-hover:scale-110 transition-transform" size={18} />
                                    <span className="text-xs uppercase tracking-widest font-black text-sea-foam">Radar Marítimo</span>
                                </div>
                                <Navigation size={14} className="text-sea-foam rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
