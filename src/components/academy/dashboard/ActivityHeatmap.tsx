'use client';

import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, subDays } from 'date-fns';

interface ActivityHeatmapProps {
    data: { date: string; count: number }[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const today = new Date();
    const startDate = subDays(today, 365);

    if (!mounted) return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-32 animate-pulse" />
    );

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-display italic text-white mb-6 flex items-center gap-3">
                <span className="text-accent">📅</span> Actividad Anual
            </h3>

            <div className="heatmap-container overflow-x-auto pb-4">
                <div className="min-w-[700px]">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={today}
                        values={Array.isArray(data) ? data : []}
                        classForValue={(value: any) => {
                            if (!value || typeof value.count === 'undefined') return 'color-empty';
                            return `color-scale-${Math.min(value.count, 4)}`;
                        }}
                        tooltipDataAttrs={() => {
                            return {};
                        }}
                    />
                </div>
            </div>

            <style jsx global>{`
                .react-calendar-heatmap .color-empty { fill: rgba(255, 255, 255, 0.05); }
                .react-calendar-heatmap .color-scale-1 { fill: #0e4429; }
                .react-calendar-heatmap .color-scale-2 { fill: #006d32; }
                .react-calendar-heatmap .color-scale-3 { fill: #26a641; }
                .react-calendar-heatmap .color-scale-4 { fill: #39d353; }
                
                .react-calendar-heatmap rect {
                    rx: 2;
                    ry: 2;
                }
                
                .react-calendar-heatmap text {
                    fill: rgba(255, 255, 255, 0.3);
                    font-size: 8px;
                }
            `}</style>

            <div className="flex items-center justify-end gap-2 text-3xs text-white/40 uppercase tracking-widest mt-2">
                <span>Menos</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-white/5" />
                    <div className="w-3 h-3 rounded-sm bg-[#0e4429]" />
                    <div className="w-3 h-3 rounded-sm bg-[#006d32]" />
                    <div className="w-3 h-3 rounded-sm bg-[#26a641]" />
                    <div className="w-3 h-3 rounded-sm bg-[#39d353]" />
                </div>
                <span>Más</span>
            </div>
        </div>
    );
}
