'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface FinancialReportsToolbarProps {
    activeFilter: string | null;
    setActiveFilter: (filter: string) => void;
    forceShowAll: boolean;
    setForceShowAll: React.Dispatch<React.SetStateAction<boolean>>;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    totalRevenue: number;
    filteredDataLength: number;
    initialDataLength: number;
    totalRecords: number;
    showDebug: boolean;
    setShowDebug: (show: boolean) => void;
    mounted: boolean;
}

export default function FinancialReportsToolbar({
    activeFilter,
    setActiveFilter,
    forceShowAll,
    setForceShowAll,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    totalRevenue,
    filteredDataLength,
    initialDataLength,
    totalRecords,
    showDebug,
    setShowDebug,
    mounted
}: FinancialReportsToolbarProps) {
    const t = useTranslations('staff_panel.financials');

    return (
        <>
            <div className="glass-panel p-8 rounded-sm relative overflow-hidden">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {[
                                { id: 'today', label: t('today') },
                                { id: 'week', label: t('week') },
                                { id: 'month', label: t('month') },
                            ].map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => {
                                        setForceShowAll(false);
                                        setActiveFilter(btn.id);
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-3xs uppercase tracking-widest font-black transition-all ${activeFilter === btn.id && !forceShowAll ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white border border-white/5'}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {[
                                { id: 'year', label: t('year') }
                            ].map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => {
                                        setForceShowAll(false);
                                        setActiveFilter(btn.id);
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-3xs uppercase tracking-widest font-black transition-all ${activeFilter === btn.id && !forceShowAll ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white border border-white/5'}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                            <button
                                onClick={() => setForceShowAll(prev => !prev)}
                                className={`px-4 py-1.5 rounded-full text-3xs uppercase tracking-widest font-black transition-all border border-orange-500/50 ${forceShowAll ? 'bg-orange-500 text-black' : 'text-orange-500/60 hover:text-orange-500'}`}
                            >
                                {t('all_data') || 'Todos los datos'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Date Inputs */}
                <div className="flex flex-wrap items-center gap-6">
                    <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 block font-black">{t('from')}</label>
                        <input
                            type="date"
                            value={startDate}
                            disabled={forceShowAll}
                            onChange={(e) => { setStartDate(e.target.value); setActiveFilter('custom'); setForceShowAll(false); }}
                            className={`bg-white/5 border border-white/10 p-3 rounded-sm text-sm outline-none focus:border-accent font-mono text-white ${forceShowAll ? 'opacity-30 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 block font-black">{t('to')}</label>
                        <input
                            type="date"
                            value={endDate}
                            disabled={forceShowAll}
                            onChange={(e) => { setEndDate(e.target.value); setActiveFilter('custom'); setForceShowAll(false); }}
                            className={`bg-white/5 border border-white/10 p-3 rounded-sm text-sm outline-none focus:border-accent font-mono text-white ${forceShowAll ? 'opacity-30 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    <div className="pt-6">
                        <div className="text-right">
                            <span className="text-technical text-accent block">{t('total_revenue')}</span>
                            <span className="text-4xl font-display text-white italic" suppressHydrationWarning>
                                {mounted ? totalRevenue.toLocaleString('es-ES') : '--'}€
                            </span>
                            <div className="text-[8px] text-white/20 font-mono mt-1" onClick={() => setShowDebug(!showDebug)}>
                                Showing {filteredDataLength} records (Loaded: {initialDataLength}, DB: {totalRecords})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug Panel */}
            {showDebug && (
                <div className="p-4 bg-black/50 font-mono text-3xs text-green-400 overflow-auto max-h-40 border border-green-500/20">
                    <div>DB Status: {totalRecords > 0 ? 'HAS DATA' : 'EMPTY or UNKNOWN'}</div>
                    <div>API Loaded: {initialDataLength} items</div>
                    <div>Filtered: {filteredDataLength} items</div>
                    <div>Filter Range: {startDate} to {endDate}</div>
                </div>
            )}
        </>
    );
}
