'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { WeatherService, WeatherData, ConditionAlert } from '@/lib/academy/weather-service';
import { Wind, Waves, Thermometer, ChevronUp, ChevronDown, Minus, CheckCircle2, AlertTriangle, AlertOctagon, Anchor, BarChart3, X, ArrowDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { apiUrl } from '@/lib/api';

interface NauticalRadarProps {
    userRankSlug: string;
    locale: string;
}

// Professional nautical colors for Beaufort scale
const getWindColor = (knots: number) => {
    if (knots < 1) return '#ffffff';
    if (knots <= 3) return '#daebff';
    if (knots <= 6) return '#add6ff';
    if (knots <= 10) return '#a1ffc8';
    if (knots <= 16) return '#70ffb3';
    if (knots <= 21) return '#feffaa';
    if (knots <= 27) return '#ffdeaa';
    if (knots <= 33) return '#ffacac';
    if (knots <= 40) return '#ff6868';
    return '#ff1dce';
};

const getWindTextColor = (knots: number) => {
    return knots > 27 ? '#ffffff' : '#000000';
};

// Mock historical data for development fallback
const MOCK_HISTORY = [
    { time: '10:00', wind: 12, gust: 15, direction: 280, tide: 1.1, temp: 14, pressure: 1012 },
    { time: '11:00', wind: 14, gust: 18, direction: 285, tide: 1.4, temp: 14.5, pressure: 1012 },
    { time: '12:00', wind: 15, gust: 20, direction: 290, tide: 1.8, temp: 15, pressure: 1011 },
    { time: '13:00', wind: 18, gust: 24, direction: 300, tide: 2.2, temp: 16, pressure: 1010 },
    { time: '14:00', wind: 16, gust: 22, direction: 310, tide: 2.5, temp: 16.5, pressure: 1010 },
    { time: '15:00', wind: 12, gust: 16, direction: 315, tide: 2.4, temp: 16, pressure: 1011 },
    { time: '16:00', wind: 13, gust: 17, direction: 320, tide: 2.1, temp: 15, pressure: 1012 },
];

const INITIAL_WEATHER: WeatherData = {
    windSpeed: 0,
    windDirection: 0,
    windGust: 0,
    tideHeight: 0,
    tideStatus: 'stable',
    nextTides: [],
    temperature: 0,
    pressure: 1013,
    condition: 'Loading...',
    visibility: 0,
    isLive: false
};

export default function NauticalRadar({ userRankSlug, locale }: NauticalRadarProps) {
    const t = useTranslations('nautical_radar');
    const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);
    const [isLoaded, setIsLoaded] = useState(false);
    const [alert, setAlert] = useState<ConditionAlert | null>(null);
    const [sweepAngle, setSweepAngle] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<any[]>(MOCK_HISTORY);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Body scroll lock
    useEffect(() => {
        if (showHistory) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showHistory]);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await WeatherService.getGetxoWeather();
                setWeather(data);
                setIsLoaded(true);
                setAlert(WeatherService.getConditionAlert(data.windSpeed, userRankSlug));
            } catch (error) {
                console.error('Error in radar fetch:', error);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 30000); // Faster update (30s)

        let animationFrame: number;
        const animate = () => {
            setSweepAngle(prev => (prev + 1.5) % 360);
            animationFrame = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            clearInterval(interval);
            cancelAnimationFrame(animationFrame);
        };
    }, [userRankSlug]);

    useEffect(() => {
        if (showHistory) {
            const fetchHistory = async () => {
                setHistoryLoading(true);
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const res = await fetch(apiUrl(`/api/weather?history=true&_cb=${Date.now()}`), {
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const data = await res.json();
                        if (data.history && Array.isArray(data.history)) {
                            setHistory(data.history);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching history:', error);
                } finally {
                    setHistoryLoading(false);
                }
            };
            fetchHistory();
        }
    }, [showHistory]);

    return (
        <>
            <section className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-[#050b14] shadow-[0_0_20px_rgba(30,58,138,0.2)]">
                {/* Header: Bridge Command Style */}
                <div className="bg-blue-900/40 border-b border-blue-500/30 px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLoaded ? (weather.isLive ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400') : 'bg-blue-400 animate-ping'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                            {t('title')}
                            {isLoaded && weather.isLive && <span className="ml-2 px-1 rounded bg-emerald-500/20 text-emerald-400 text-[8px] border border-emerald-500/30">LIVE</span>}
                            {!isLoaded && <span className="ml-2 text-[8px] opacity-40 animate-pulse">CONNECTING...</span>}
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400/60 font-bold uppercase tracking-tighter">{t('location')}</span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Visual Radar Screen */}
                    <div className="relative aspect-square w-full max-w-[220px] mx-auto group">
                        {/* Outer Rings */}
                        <div className="absolute inset-0 border-[0.5px] border-blue-500/30 rounded-full" />
                        <div className="absolute inset-[15%] border-[0.5px] border-blue-500/20 rounded-full shadow-[inset_0_0_15px_rgba(59,130,246,0.05)]" />
                        <div className="absolute inset-[30%] border-[0.5px] border-blue-500/15 rounded-full" />
                        <div className="absolute inset-[45%] border-[0.5px] border-blue-500/10 rounded-full" />

                        {/* Cardinal Points */}
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[12px] font-black text-blue-300 drop-shadow-[0_0_5px_rgba(147,197,253,0.5)]">N</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-500/40">S</span>
                        <span className="absolute top-1/2 -left-2 -translate-y-1/2 text-[10px] font-black text-blue-500/40">W</span>
                        <span className="absolute top-1/2 -right-2 -translate-y-1/2 text-[10px] font-black text-blue-500/40">E</span>

                        {/* Crosshair */}
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/10" />
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-500/10" />

                        {/* Wind Arrow Displayed on Radar */}
                        <div
                            className="absolute inset-0 transition-transform duration-1000 ease-out z-20"
                            style={{ transform: `rotate(${weather.windDirection || 0}deg)` }}
                        >
                            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-accent drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]" />
                                <div className="w-[1px] h-14 bg-gradient-to-t from-transparent via-accent to-accent opacity-40" />
                            </div>
                        </div>

                        {/* Radar Sweep Animation */}
                        <div
                            className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-blue-400/20 z-10"
                            style={{
                                transform: `rotate(${sweepAngle}deg)`,
                                clipPath: 'conic-gradient(from 0deg, rgba(30,58,138,0.4) 0deg, transparent 60deg)'
                            }}
                        />

                        {/* Center Point */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)] border border-white/20" />

                        {/* Live Data Overlays on Radar */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-950/90 border border-blue-500/40 px-3 py-1 rounded backdrop-blur-md shadow-lg z-30">
                            <div className="flex flex-col items-center">
                                <span className="text-[16px] font-mono text-blue-300 font-black tracking-tighter">
                                    {Number(weather?.windSpeed || 0).toFixed(0)}
                                    <span className="text-[10px] ml-1 text-white/40">{t('knots').toUpperCase()}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Instrument Data Panels */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Wind Panel */}
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl group hover:bg-white/[0.05] transition-all hover:border-blue-500/20">
                            <div className="flex justify-between items-start mb-2">
                                <Wind className="w-4 h-4 text-blue-400" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{t('wind')}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-display italic text-white font-black">{weather.windSpeed || 0}</span>
                                <span className="text-[10px] font-bold text-blue-400">AWS</span>
                            </div>
                            <div className="flex justify-between mt-2 border-t border-white/5 pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/20 uppercase tracking-widest">{t('gust')}</span>
                                    <span className="text-xs font-mono text-amber-400 font-bold">{weather.windGust || 0}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-white/20 uppercase tracking-widest">TWA</span>
                                    <span className="text-xs font-mono text-blue-300 font-bold">{(weather.windDirection || 0)}°</span>
                                </div>
                            </div>
                        </div>

                        {/* Tides Panel */}
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl group hover:bg-white/[0.05] transition-all hover:border-cyan-500/20">
                            <div className="flex justify-between items-start mb-2">
                                <Waves className="w-4 h-4 text-cyan-400" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{t('tide')}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-display italic text-white font-black">
                                    {weather?.tideHeight !== undefined && weather?.tideHeight !== null
                                        ? Number(weather.tideHeight).toFixed(1)
                                        : '--.-'}
                                </span>
                                <span className="text-[10px] font-bold text-cyan-400">DEPTH</span>
                            </div>
                            <div className="flex flex-col mt-2 border-t border-white/5 pt-2">
                                <span className="text-[9px] font-black text-cyan-400/60 uppercase tracking-wider flex items-center gap-1">
                                    {weather.tideStatus === 'rising' ? <ChevronUp className="w-3 h-3" /> : weather.tideStatus === 'falling' ? <ChevronDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                    {weather.tideStatus === 'rising' ? t('rising') : weather.tideStatus === 'falling' ? t('falling') : t('stable')}
                                </span>
                                <span className="text-[10px] text-white/30 font-mono mt-1">
                                    {t('next_tide', { time: weather.nextTides[0]?.time || '--:--', type: weather.nextTides[0]?.type === 'high' ? 'H' : 'L' })}
                                </span>
                            </div>
                        </div>

                        {/* Additional Instruments (Temp/Pressure/Visibility) */}
                        <div className="col-span-2 grid grid-cols-3 gap-2">
                            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg flex flex-col items-center">
                                <Thermometer className="w-3 h-3 text-orange-400 mb-1" />
                                <span className="text-[8px] text-white/20 uppercase tracking-widest mb-1">{t('temp')}</span>
                                <span className="text-xs font-mono text-white font-bold">{typeof weather?.temperature === 'number' ? weather.temperature.toFixed(1) : (parseFloat(weather?.temperature as any) || 0).toFixed(1)}°C</span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg flex flex-col items-center">
                                <Anchor className="w-3 h-3 text-blue-400 mb-1" />
                                <span className="text-[8px] text-white/20 uppercase tracking-widest mb-1">{t('pressure')}</span>
                                <span className="text-xs font-mono text-white font-bold">{weather.pressure || '----'}</span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg flex flex-col items-center">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 mb-1" />
                                <span className="text-[8px] text-white/20 uppercase tracking-widest mb-1">{t('visibility')}</span>
                                <span className="text-xs font-mono text-white font-bold">{weather.visibility || '--'}nm</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Condition Alert: The Intelligence Layer */}
                {alert && (
                    <div className={`p-4 border-t border-blue-500/20 flex items-center gap-4 ${alert.type === 'ideal' ? 'bg-emerald-500/5' :
                        alert.type === 'caution' ? 'bg-amber-500/5' :
                            'bg-red-500/5'
                        }`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-white/10 ${alert.type === 'ideal' ? 'bg-emerald-500/20 text-emerald-400' :
                            alert.type === 'caution' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {alert.type === 'ideal' ? <CheckCircle2 className="w-6 h-6" /> : alert.type === 'caution' ? <AlertTriangle className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t('advisory')}</span>
                                <button
                                    onClick={() => setShowHistory(true)}
                                    className="text-[10px] font-black text-accent hover:underline flex items-center gap-1"
                                >
                                    <BarChart3 className="w-3 h-3" />
                                    {t('action_history')}
                                </button>
                            </div>
                            <p className={`text-[11px] font-bold uppercase tracking-wider leading-relaxed ${alert.type === 'ideal' ? 'text-emerald-400' :
                                alert.type === 'caution' ? 'text-amber-400' :
                                    'text-red-400'
                                }`}>
                                {alert.message}
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* History Modal - Portalized */}
            {mounted && showHistory && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
                >
                    <div className="bg-[#050b14] border border-blue-500/30 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="bg-blue-900/40 p-4 border-b border-blue-500/30 flex justify-between items-center shrink-0">
                            <h3 className="text-white font-display italic uppercase tracking-widest text-sm flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-accent" />
                                {t('history_title')}
                                {historyLoading && <span className="ml-2 text-[8px] animate-pulse text-accent">SYNCING...</span>}
                            </h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="text-white/40 hover:text-white transition-colors p-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar ${historyLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Windguru Style Meteogram */}
                            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden shrink-0">
                                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-500/20">
                                    <div className="min-w-[800px]">
                                        {/* Hours Row */}
                                        <div className="flex border-b border-white/5 bg-white/5">
                                            <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20">{t('history_time')}</div>
                                            {Array.isArray(history) && history.map((h, i) => (
                                                <div key={i} className="flex-1 text-center p-3 text-[10px] font-mono text-white/60 border-l border-white/5">{h?.time || '--:--'}</div>
                                            ))}
                                        </div>

                                        {/* Wind Speed Row (Rich Colors) */}
                                        <div className="flex border-b border-white/5">
                                            <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20">{t('history_wind')}</div>
                                            {Array.isArray(history) && history.map((h, i) => {
                                                const wind = h ? (typeof h.wind === 'number' ? h.wind : parseFloat(h.wind as any) || 0) : 0;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex-1 text-center p-3 text-xs font-black border-l border-white/10"
                                                        style={{ backgroundColor: getWindColor(wind), color: getWindTextColor(wind) }}
                                                    >
                                                        {Math.round(wind)}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Wind Gusts */}
                                        <div className="flex border-b border-white/5">
                                            <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20">{t('history_gusts')}</div>
                                            {Array.isArray(history) && history.map((h, i) => (
                                                <div key={i} className="flex-1 text-center p-3 text-[10px] font-bold text-amber-500/80 border-l border-white/5">
                                                    {h ? (typeof h.gust === 'number' ? Math.round(h.gust) : Math.round(parseFloat(h.gust as any) || 0)) : 0}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Wind Direction Arrows */}
                                        <div className="flex border-b border-white/5">
                                            <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20">{t('history_direction')}</div>
                                            {Array.isArray(history) && history.map((h, i) => (
                                                <div key={i} className="flex-1 flex items-center justify-center p-3 border-l border-white/5 bg-blue-900/5">
                                                    <ArrowDown
                                                        size={14}
                                                        className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                        style={{ transform: `rotate(${h?.direction || 0}deg)` }}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Temperature Row */}
                                        <div className="flex border-b border-white/5">
                                            <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20">{t('history_temp')}</div>
                                            {Array.isArray(history) && history.map((h, i) => (
                                                <div key={i} className="flex-1 text-center p-3 text-[10px] font-mono text-orange-400 border-l border-white/5">
                                                    {h && typeof h.temp !== 'undefined' ? (typeof h.temp === 'number' ? h.temp.toFixed(0) : (parseFloat(h.temp as any) || 0).toFixed(0)) : '--'}º
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tide Level */}
                                        <div className="flex">
                                            <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20">{t('history_tide')}</div>
                                            {Array.isArray(history) && history.map((h, i) => (
                                                <div key={i} className="flex-1 text-center p-3 text-[10px] font-mono text-cyan-400 border-l border-white/5">
                                                    {h && typeof h.tide !== 'undefined' ? (typeof h.tide === 'number' ? h.tide.toFixed(1) : (parseFloat(h.tide as any) || 0).toFixed(1)) : '--.-'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Supplementary Charts for Visualizing Trends */}
                            <div className="grid grid-cols-1 gap-8">
                                {/* Velocity Chart (Wind & Gusts) */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 shadow-inner">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Wind className="w-4 h-4 text-blue-400" /> {t('wind_chart_title')}
                                        </h4>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t('wind_chart_wind_label')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t('wind_chart_gust_label')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={Array.isArray(history) ? history : []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="#ffffff20"
                                                    fontSize={9}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
                                                    label={{ value: t('history_time').toUpperCase(), position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 900 }}
                                                />
                                                <YAxis
                                                    stroke="#ffffff20"
                                                    fontSize={9}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={[0, 80]}
                                                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80]}
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
                                                    label={{ value: t('knots').toUpperCase(), angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 900, offset: 15 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#050b14', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '4px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                                    itemStyle={{ fontWeight: 700 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="wind"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#000' }}
                                                    activeDot={{ r: 5, fill: '#34d399' }}
                                                    name={t('wind_chart_wind_label')}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="gust"
                                                    stroke="#ef4444"
                                                    strokeWidth={2}
                                                    dot={{ r: 3, fill: '#ef4444', strokeWidth: 1, stroke: '#000' }}
                                                    activeDot={{ r: 5, fill: '#f87171' }}
                                                    name={t('wind_chart_gust_label')}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Direction Chart */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4 text-blue-400" /> {t('history_direction')}
                                        </h4>
                                    </div>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={Array.isArray(history) ? history : []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="#ffffff20"
                                                    fontSize={9}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
                                                    label={{ value: t('history_time').toUpperCase(), position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 900 }}
                                                />
                                                <YAxis
                                                    stroke="#ffffff20"
                                                    fontSize={9}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={[0, 360]}
                                                    ticks={[0, 90, 180, 270, 360]}
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
                                                    tickFormatter={(value) => {
                                                        if (value === 0 || value === 360) return '0° (N)';
                                                        if (value === 90) return '90° (E)';
                                                        if (value === 180) return '180° (S)';
                                                        if (value === 270) return '270° (W)';
                                                        return `${value}°`;
                                                    }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#050b14', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '4px', fontSize: '10px' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="direction"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 1, stroke: '#000' }}
                                                    activeDot={{ r: 5, fill: '#60a5fa' }}
                                                    name={t('history_direction')}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900/10 p-4 border-t border-blue-500/10 shrink-0">
                            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] text-center">
                                {t('history_footer')}
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
