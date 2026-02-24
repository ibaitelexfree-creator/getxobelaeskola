'use client';

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, ArrowUp, ArrowDown } from 'lucide-react';
import { getTidePredictions, getTideLevel } from '@/lib/puertos-del-estado';

interface TideTableProps {
    date: Date;
    onDateChange: (date: Date) => void;
}

export default function TideTable({ date, onDateChange }: TideTableProps) {
    const predictions = useMemo(() => getTidePredictions(date), [date]);

    // Generate chart data for every 15 minutes
    const chartData = useMemo(() => {
        const data: any[] = [];
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        let current = new Date(start);
        while (current <= end) {
            data.push({
                time: format(current, 'HH:mm'),
                height: getTideLevel(current),
                timestamp: current.getTime()
            });
            current = new Date(current.getTime() + 15 * 60000); // Add 15 min
        }
        return data;
    }, [date]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
                        <Droplets className="w-6 h-6 text-blue-400" />
                        Tabla de Mareas - Bilbao
                    </h2>
                    <p className="text-sm text-white/40 mt-1">
                        Datos simulados basados en constantes armónicas (M2).
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => {
                            const newDate = new Date(date);
                            newDate.setDate(date.getDate() - 1);
                            onDateChange(newDate);
                        }}
                        className="p-2 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                    >
                        ←
                    </button>
                    <span className="text-sm font-mono font-bold text-blue-200 min-w-[140px] text-center capitalize">
                        {format(date, 'EEEE, d MMM', { locale: es })}
                    </span>
                    <button
                        onClick={() => {
                            const newDate = new Date(date);
                            newDate.setDate(date.getDate() + 1);
                            onDateChange(newDate);
                        }}
                        className="p-2 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-white/10">
                {/* Table Section */}
                <div className="p-6 lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Predicciones del Día</h3>
                    <div className="space-y-3">
                        {predictions.map((pred: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${pred.type === 'HIGH' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {pred.type === 'HIGH' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                                            {pred.type === 'HIGH' ? 'Pleamar' : 'Bajamar'}
                                        </div>
                                        <div className="text-xs text-white/40 font-mono">
                                            {format(pred.time, 'HH:mm')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-white tabular-nums tracking-tight">
                                        {pred.height.toFixed(2)}<span className="text-xs text-white/40 font-normal ml-1">m</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-900/10 rounded-lg border border-blue-500/20">
                        <p className="text-[10px] text-blue-200/60 leading-relaxed">
                            <span className="font-bold text-blue-400 block mb-1">NOTA IMPORTANTE:</span>
                            Estos datos son una simulación educativa y no deben usarse para navegación real. Consulte siempre las tablas oficiales de Puertos del Estado.
                        </p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="p-6 lg:col-span-2 flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Curva de Marea (24h)</h3>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTide" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#ffffff40"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#ffffff40"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => `${val.toFixed(1)}m`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#60a5fa' }}
                                    formatter={(value: any) => [`${value.toFixed(2)} m`, 'Altura']}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="height"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTide)"
                                    animationDuration={1000}
                                />
                                {/* Reference Line for Mean Level could be added */}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
