'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Wind, Compass, Battery, Wifi, AlertTriangle } from 'lucide-react';

interface WindReading {
    id: number;
    sensor_id: string;
    speed_knots: number;
    direction_deg: number;
    gust_knots: number;
    battery_level: number;
    timestamp: string;
}

export default function WindStation() {
    const [readings, setReadings] = useState<WindReading[]>([]);
    const [currentReading, setCurrentReading] = useState<WindReading | null>(null);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchHistory();

        const channel = supabase
            .channel('iot-wind-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'iot_wind_readings'
                },
                (payload) => {
                    const newReading = payload.new as WindReading;
                    setCurrentReading(newReading);
                    setReadings(prev => {
                        const updated = [...prev, newReading];
                        return updated.slice(-60); // Keep last 60 readings
                    });
                }
            )
            .subscribe((status) => {
                setConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('iot_wind_readings')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(60);

            if (error) {
                console.error('Supabase error:', error);
            }

            if (data) {
                // Reverse to show oldest first on graph
                const reversed = [...data].reverse();
                setReadings(reversed);
                if (reversed.length > 0) {
                    setCurrentReading(reversed[reversed.length - 1]);
                }
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-white/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    const formatTime = (iso: string) => {
        if (!iso) return '';
        const date = new Date(iso);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
            <header className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="bg-cyan-500/20 p-3 rounded-xl text-cyan-400">
                        <Wind size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display italic text-white">Estación Meteorológica</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold">IoT Sensor • Club Náutico Getxo</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs font-mono">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${connected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                        {connected ? 'ONLINE' : 'DISCONNECTED'}
                    </div>
                    {currentReading && (
                        <div className="flex items-center gap-2 text-white/40 mt-1">
                            <Battery size={12} />
                            <span>{currentReading.battery_level}% BAT</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Gauge - Visual Representation */}
                <div className="lg:col-span-1 bg-nautical-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

                    {currentReading ? (
                        <>
                            <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                                {/* Compass Ring */}
                                <div className="absolute inset-0 border border-white/10 rounded-full" />
                                <div className="absolute inset-2 border border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />

                                {/* Cardinal Points */}
                                <div className="absolute inset-0 flex flex-col justify-between py-2 text-xs font-black text-white/30 uppercase tracking-widest pointer-events-none">
                                    <span className="text-center">N</span>
                                    <span className="text-center">S</span>
                                </div>
                                <div className="absolute inset-0 flex flex-row justify-between px-2 text-xs font-black text-white/30 uppercase tracking-widest pointer-events-none items-center">
                                    <span>W</span>
                                    <span>E</span>
                                </div>

                                {/* Wind Direction Indicator */}
                                <div
                                    className="absolute w-full h-full transition-transform duration-1000 ease-out flex items-center justify-center"
                                    style={{ transform: `rotate(${currentReading.direction_deg}deg)` }}
                                >
                                    <div className="w-1 h-28 bg-gradient-to-t from-transparent via-cyan-400/50 to-cyan-400 rounded-full origin-bottom transform -translate-y-1/2 blur-[2px]" />
                                    <div className="absolute top-4">
                                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[20px] border-b-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                    </div>
                                </div>

                                {/* Center Speed Readout */}
                                <div className="relative z-10 text-center bg-nautical-black/90 backdrop-blur-md rounded-full w-32 h-32 flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                                    <span className="text-5xl font-bold text-white tabular-nums tracking-tighter drop-shadow-lg">{currentReading.speed_knots.toFixed(1)}</span>
                                    <span className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold mt-1">KNOTS</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Compass size={14} className="text-white/40" />
                                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Dirección</span>
                                    </div>
                                    <span className="text-2xl font-mono text-white tabular-nums">{currentReading.direction_deg.toFixed(0)}°</span>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Wind size={14} className="text-pink-400/70" />
                                        <span className="text-[10px] text-pink-400/70 uppercase tracking-widest font-bold">Racha Máx</span>
                                    </div>
                                    <span className="text-2xl font-mono text-pink-400 tabular-nums">{currentReading.gust_knots?.toFixed(1) || '-'}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-white/30 text-center py-20">
                            <Wifi className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Esperando conexión con sensor...</p>
                        </div>
                    )}
                </div>

                {/* History Chart */}
                <div className="lg:col-span-2 bg-nautical-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
                            Historial (Última hora)
                        </h3>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-white/30">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                Viento Real
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                Rachas
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={readings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={formatTime}
                                    stroke="#ffffff20"
                                    tick={{fontSize: 10, fill: '#ffffff50'}}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#ffffff20"
                                    tick={{fontSize: 10, fill: '#ffffff50'}}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: '#ffffff10',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    formatter={(value: any, name: string) => [
                                        `${value} kn`,
                                        name === 'speed_knots' ? 'Viento' : 'Racha'
                                    ]}
                                    labelFormatter={(label) => formatTime(label)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="speed_knots"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorSpeed)"
                                    isAnimationActive={false}
                                    name="speed_knots"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="gust_knots"
                                    stroke="#ec4899"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                    dot={false}
                                    isAnimationActive={false}
                                    name="gust_knots"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
