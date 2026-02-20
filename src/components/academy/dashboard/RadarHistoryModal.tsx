'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { X, BarChart3, Wind, Thermometer, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RadarHistoryModalProps {
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    history: any[];
    historyLoading: boolean;
    getWindColor: (knots: number) => string;
    getWindTextColor: (knots: number) => string;
}

export default function RadarHistoryModal({
    showHistory,
    setShowHistory,
    history,
    historyLoading,
    getWindColor,
    getWindTextColor
}: RadarHistoryModalProps) {
    const t = useTranslations('nautical_radar');

    if (!showHistory) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        >
            <div className="bg-[#050b14] border border-blue-500/30 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-blue-900/40 p-4 border-b border-blue-500/30 flex justify-between items-center shrink-0">
                    <h3 className="text-white font-display italic uppercase tracking-widest text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-accent" />
                        {t('history_title')}
                        {historyLoading && <span className="ml-2 text-[8px] animate-pulse text-accent uppercase">{t('syncing')}</span>}
                    </h3>
                    <button
                        onClick={() => setShowHistory(false)}
                        className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 rounded-full"
                        aria-label={t('action_close') || 'Cerrar'}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`flex-1 overflow-y-auto p-6 space-y-12 custom-scrollbar ${historyLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Meteogram Style Data Grid */}
                    <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden shrink-0">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-500/20">
                            <div style={{ minWidth: history.length > 12 ? `${history.length * 60}px` : '100%' }}>
                                {/* Hours Row */}
                                <div className="flex border-b border-white/5 bg-white/5">
                                    <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20 sticky left-0 z-10 border-r border-white/5 backdrop-blur-md">{t('history_time')}</div>
                                    {history.map((h, i) => (
                                        <div key={i} className="flex-1 text-center p-3 text-[10px] font-mono text-white/60 border-l border-white/5">{h?.time || '--:--'}</div>
                                    ))}
                                </div>

                                {/* Wind Speed Row */}
                                <div className="flex border-b border-white/5">
                                    <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20 sticky left-0 z-10 border-r border-white/5 backdrop-blur-md">{t('history_wind')}</div>
                                    {history.map((h, i) => {
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
                                    <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20 sticky left-0 z-10 border-r border-white/5 backdrop-blur-md">{t('history_gusts')}</div>
                                    {history.map((h, i) => (
                                        <div key={i} className="flex-1 text-center p-3 text-[10px] font-bold text-amber-500/80 border-l border-white/5">
                                            {h ? (typeof h.gust === 'number' ? Math.round(h.gust) : Math.round(parseFloat(h.gust as any) || 0)) : 0}
                                        </div>
                                    ))}
                                </div>

                                {/* Wind Direction Arrows */}
                                <div className="flex border-b border-white/5">
                                    <div className="w-28 shrink-0 p-3 text-[10px] font-black uppercase text-white/40 flex items-center bg-black/20 sticky left-0 z-10 border-r border-white/5 backdrop-blur-md">{t('history_direction')}</div>
                                    {history.map((h, i) => (
                                        <div key={i} className="flex-1 flex items-center justify-center p-3 border-l border-white/5 bg-blue-900/5">
                                            <ArrowDown
                                                size={14}
                                                className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                style={{ transform: `rotate(${h?.direction || 0}deg)` }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Charts for Visualizing Trends */}
                    <div className="grid grid-cols-1 gap-10">
                        {/* Velocity Chart (Wind & Gusts) - AREA CHART */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Wind className="w-5 h-5 text-blue-400" /> {t('wind_chart_title')}
                                </h4>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{t('wind_chart_wind_label')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{t('wind_chart_gust_label')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-blue-500/20">
                                <div style={{ width: history.length > 24 ? `${history.length * 30}px` : '100%', minWidth: '100%' }} className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorGust" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="time" stroke="#ffffff10" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.3)' }} />
                                            <YAxis stroke="#ffffff10" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.3)' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#050b14', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', fontSize: '10px' }}
                                                itemStyle={{ fontWeight: 800 }}
                                            />
                                            <Area type="monotone" dataKey="wind" stroke="#10b981" strokeWidth={3} fill="url(#colorWind)" name={t('wind_chart_wind_label')} />
                                            <Area type="monotone" dataKey="gust" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" fill="url(#colorGust)" name={t('wind_chart_gust_label')} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Temp / Tide Mixed Chart - Dual Axis */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Thermometer className="w-5 h-5 text-orange-400" /> {t('history_temp')} & {t('history_tide')}
                                </h4>
                            </div>
                            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-blue-500/20">
                                <div style={{ width: history.length > 24 ? `${history.length * 30}px` : '100%', minWidth: '100%' }} className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="time" stroke="#ffffff10" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.3)' }} />
                                            <YAxis yAxisId="left" stroke="#ffffff10" fontSize={9} tick={{ fill: '#fb923c' }} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#ffffff10" fontSize={9} tick={{ fill: '#22d3ee' }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#050b14', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', fontSize: '10px' }} />
                                            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#fb923c" strokeWidth={3} dot={{ r: 4, fill: '#fb923c', stroke: '#050b14' }} name={t('history_temp')} />
                                            <Line yAxisId="right" type="stepAfter" dataKey="tide" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee', stroke: '#050b14' }} name={t('history_tide')} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
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
        </div>
    );
}
