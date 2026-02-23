'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ChartDataPoint } from './types';

interface FinancialChartProps {
    chartData: ChartDataPoint[];
    maxChartValue: number;
    mounted: boolean;
    exportToCSV: () => void;
    filteredDataLength: number;
    startDate: string;
}

export default function FinancialChart({
    chartData, maxChartValue, mounted, exportToCSV, filteredDataLength, startDate
}: FinancialChartProps) {
    const t = useTranslations('staff_panel.financials');
    const CHART_H = 260;

    return (
        <div className="glass-panel p-12 rounded-sm space-y-12">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-8">
                <h3 className="text-2xl font-display text-white italic underline underline-offset-[12px] decoration-accent/30 decoration-1">{t('chart_title')}</h3>

                <button
                    onClick={exportToCSV}
                    disabled={filteredDataLength === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent/5 hover:bg-accent/10 text-accent border border-accent/20 transition-all rounded-full text-3xs uppercase tracking-[0.2em] font-black disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                >
                    <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {t('download_report')}
                </button>
            </header>

            <div className="relative h-[300px] w-full flex items-end gap-2 group/chart border-b border-white/5 pb-2">
                {!mounted ? (
                    <div className="w-full h-full flex items-center justify-center italic text-white/10 animate-pulse">
                        {t('loading_chart')}
                    </div>
                ) : chartData.length > 0 ? chartData.map((d, i) => {
                    const barHeight = Math.max((d.amount / maxChartValue) * CHART_H, 4);
                    return (
                        <div
                            key={i}
                            className="flex-1 flex flex-col justify-end items-center group/bar h-full relative"
                            title={`${d.label}: ${d.amount.toLocaleString()}€`}
                        >
                            <div
                                className="w-full bg-accent/40 border-t-2 border-accent group-hover/bar:bg-accent/80 transition-all duration-500 rounded-t-xs relative shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]"
                                style={{ height: `${barHeight}px` }}
                            >
                                <div className="absolute top-[-28px] left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-3xs text-accent font-black font-mono whitespace-nowrap bg-nautical-black/80 px-2 py-1 rounded-sm">
                                    {mounted ? d.amount.toLocaleString() : '...'}€
                                </div>
                            </div>
                            <span className="absolute bottom-[-32px] text-3xs text-white/30 font-mono -rotate-45 origin-right lg:rotate-0 lg:origin-center group-hover/bar:text-accent transition-colors tracking-tighter">
                                {d.label}
                            </span>
                        </div>
                    );
                }) : startDate ? (
                    <div className="w-full h-full border border-dashed border-white/5 flex items-center justify-center italic text-white/10 text-sm">
                        {t('no_data', { count: filteredDataLength })}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center italic text-white/10 animate-pulse">
                        {t('initializing')}
                    </div>
                )}

                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                    {[0, 1, 2, 3, 4].map(l => <div key={l} className="w-full h-px bg-white" />)}
                </div>
            </div>
        </div>
    );
}
