'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { TideEvent, calculateTideHeight, generateTideCurve, timeToMinutes, minutesToTime } from '@/lib/tides/calculator';
import defaultTideData from '@/data/tides-bilbao.json';

interface TideCalculatorProps {
    initialTime?: string; // HH:MM
    initialChartDepth?: number; // meters
}

export default function TideCalculator({
    initialTime = "12:00",
    initialChartDepth = 5.0
}: TideCalculatorProps) {
    const [time, setTime] = useState<string>(initialTime);
    const [chartDepth, setChartDepth] = useState<number>(initialChartDepth);
    const [tideHeight, setTideHeight] = useState<number | null>(null);

    // Use default data for now, could be passed as prop later
    const events: TideEvent[] = (defaultTideData.events as any[]).map(e => ({
        time: e.time,
        height: e.height,
        type: e.type as 'high' | 'low'
    }));

    // Generate curve data for chart
    const curveData = useMemo(() => generateTideCurve(events, 15), [events]);

    // Calculate current values
    useEffect(() => {
        const minutes = timeToMinutes(time);
        const height = calculateTideHeight(minutes, events);
        setTideHeight(height);
    }, [time, events]);

    const totalDepth = tideHeight !== null ? (chartDepth + tideHeight).toFixed(2) : '--';
    const tideHeightDisplay = tideHeight !== null ? tideHeight.toFixed(2) : '--';

    // Slider handlers
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = parseInt(e.target.value);
        setTime(minutesToTime(minutes));
    };

    const currentMinutes = timeToMinutes(time);
    const minTime = timeToMinutes(events[0].time);
    const maxTime = timeToMinutes(events[events.length - 1].time);

    return (
        <div className="w-full bg-nautical-black/50 border border-white/10 rounded-lg overflow-hidden shadow-xl backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-white font-display italic text-xl">
                    Calculadora de Mareas <span className="text-accent not-italic text-sm ml-2">({defaultTideData.port})</span>
                </h3>
                <div className="text-white/60 text-xs font-mono">
                    {defaultTideData.date}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Left Column: Controls & Stats */}
                <div className="space-y-6">
                    {/* Time Control */}
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                        <label className="block text-accent text-xs uppercase tracking-widest font-bold mb-2">
                            Hora: <span className="text-white ml-2 text-lg font-mono">{time}</span>
                        </label>
                        <input
                            type="range"
                            min={minTime}
                            max={maxTime}
                            step="1"
                            value={currentMinutes}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                        <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                            <span>{events[0].time}</span>
                            <span>{events[events.length - 1].time}</span>
                        </div>
                    </div>

                    {/* Chart Depth Input */}
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                        <label className="block text-accent text-xs uppercase tracking-widest font-bold mb-2">
                            Sonda en Carta (m)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={chartDepth}
                            onChange={(e) => setChartDepth(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/40 border border-white/20 rounded p-2 text-white font-mono focus:border-accent focus:outline-none"
                        />
                        <p className="text-[10px] text-white/50 mt-2">
                            Profundidad indicada en la carta náutica (Bajamar Escondida).
                        </p>
                    </div>

                    {/* Results Display */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded text-center">
                            <span className="block text-blue-300 text-[10px] uppercase tracking-widest mb-1">Altura Marea</span>
                            <span className="text-2xl font-bold text-white font-mono">
                                {tideHeightDisplay}<span className="text-xs font-normal text-white/60 ml-1">m</span>
                            </span>
                        </div>
                        <div className="bg-accent/10 border border-accent/30 p-4 rounded text-center">
                            <span className="block text-accent text-[10px] uppercase tracking-widest mb-1">Sonda Total</span>
                            <span className="text-3xl font-black text-white font-mono">
                                {totalDepth}<span className="text-xs font-normal text-white/60 ml-1">m</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Chart & Table */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tide Chart */}
                    <div className="bg-white/5 p-4 rounded border border-white/10 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={curveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00aaff" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00aaff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="minutes"
                                    type="number"
                                    domain={[minTime, maxTime]}
                                    tickFormatter={(val) => minutesToTime(val)}
                                    stroke="#ffffff40"
                                    tick={{fontSize: 10}}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#ffffff40"
                                    tick={{fontSize: 10}}
                                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                />
                                <Tooltip
                                    labelFormatter={(val) => minutesToTime(val as number)}
                                    contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff20', color: '#fff' }}
                                    itemStyle={{ color: '#00aaff' }}
                                    formatter={(value: number) => [`${value}m`, 'Altura']}
                                />
                                {/* Current Time Indicator */}
                                <ReferenceLine x={currentMinutes} stroke="#ffcc00" strokeWidth={2} label={{ value: 'Hora', position: 'top', fill: '#ffcc00', fontSize: 10 }} />

                                <Area
                                    type="monotone"
                                    dataKey="height"
                                    stroke="#00aaff"
                                    fillOpacity={1}
                                    fill="url(#colorHeight)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tide Table */}
                    <div className="overflow-hidden rounded border border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/10 text-white/70 uppercase text-xs">
                                <tr>
                                    <th className="p-3 font-normal tracking-wider">Hora</th>
                                    <th className="p-3 font-normal tracking-wider">Tipo</th>
                                    <th className="p-3 font-normal tracking-wider text-right">Altura (m)</th>
                                </tr>
                            </thead>
                            <tbody className="text-white/80 divide-y divide-white/5">
                                {events.map((event, i) => {
                                    const eventMinutes = timeToMinutes(event.time);
                                    // Highlight if within 30 mins of current time
                                    const isActive = Math.abs(eventMinutes - currentMinutes) < 30;

                                    return (
                                        <tr key={i} className={`transition-colors ${isActive ? 'bg-accent/10 text-white' : 'hover:bg-white/5'}`}>
                                            <td className="p-3 font-mono">{event.time}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                    event.type === 'high' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'
                                                }`}>
                                                    {event.type === 'high' ? 'Pleamar' : 'Bajamar'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold">{event.height}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
