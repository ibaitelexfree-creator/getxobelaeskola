'use client';

import React, { useMemo, useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { useTranslation } from 'react-i18next';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area,
    AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Filter } from 'lucide-react';

export default function SyncHistoryGraph() {
    const { t } = useTranslation();
    const { syncHistory } = useMissionStore();
    const [selectedService, setSelectedService] = useState<string>('all');

    const services = useMemo(() => {
        const unique = new Set(syncHistory.map(h => h.service_id));
        return ['all', ...Array.from(unique)];
    }, [syncHistory]);

    const chartData = useMemo(() => {
        // Group by timestamp to show multiple lines or single line
        // For simplicity, we just filter and format
        const filtered = selectedService === 'all'
            ? syncHistory
            : syncHistory.filter(h => h.service_id === selectedService);

        // Sort by timestamp
        return [...filtered].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(h => ({
                time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fullTime: new Date(h.timestamp).toLocaleString(),
                value: h.metric_value,
                service: h.service_id.toUpperCase(),
                label: h.metric_label
            }))
            .slice(-30); // Last 30 points
    }, [syncHistory, selectedService]);

    if (syncHistory.length === 0) {
        return (
            <div className="glass-panel p-8 rounded-[2.5rem] border-4 border-white/10 flex flex-col items-center justify-center text-white/40 min-h-[300px]">
                <Activity size={48} className="mb-4 opacity-20" />
                <p className="font-mono text-sm uppercase tracking-widest">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-[2.5rem] border-4 border-white/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-white text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Activity size={24} className="text-status-green" />
                        {t('analytics.usage_trends')}
                    </h2>
                    <p className="text-white/40 text-xs font-mono mt-1 uppercase">{t('analytics.sync_history')}</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <Filter size={14} className="ml-2 text-white/40" />
                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="bg-transparent text-white text-xs font-black uppercase outline-none cursor-pointer pr-2"
                    >
                        <option value="all" className="bg-[#0a0a0a]">{t('analytics.all_services')}</option>
                        {services.filter(s => s !== 'all').map(s => (
                            <option key={s} value={s} className="bg-[#0a0a0a]">{s.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FF95" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00FF95" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                                border: '2px solid rgba(255,255,255,0.1)',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(10px)'
                            }}
                            itemStyle={{ color: '#00FF95', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#00FF95"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-status-green" />
                        <span className="text-white/40 text-[10px] uppercase font-mono tracking-widest">{selectedService === 'all' ? t('analytics.all_services') : selectedService.toUpperCase()}</span>
                    </div>
                </div>
                <span className="text-white/20 text-[10px] font-mono tracking-tighter uppercase">{chartData.length} data points cached</span>
            </div>
        </div>
    );
}
