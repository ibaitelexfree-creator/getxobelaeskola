'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AccessibleModal from '../shared/AccessibleModal';
import { apiUrl } from '@/lib/api';
import { parseAmount } from '@/lib/utils/financial';

interface FinancialTransaction {
    id: string;
    created_at?: string;
    fecha_reserva?: string;
    fecha_pago?: string | null;
    monto_total: number | string;
    estado_pago: string;
    profiles?: { nombre: string; apellidos?: string };
    servicios_alquiler?: { nombre_es: string };
    history?: any[];
    _field?: string;
    [key: string]: any;
}

interface FinancialReportsClientProps {
    paginatedData: FinancialTransaction[];
    totalRecords: number;
    stats: {
        total_revenue: number;
        daily_stats: { date: string; amount: number }[];
    };
    services: { id: string; nombre_es: string }[];
    initialParams: {
        view: string;
        startDate: string;
        endDate: string;
        page: number;
        limit: number;
        search: string;
        status: string;
        service: string;
    };
}

// Fixed Date formatter
const ClientDate = ({ date }: { date: string | Date | null | undefined }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || !date) return <span className="opacity-0">--/--/---- --:--:--</span>;
    try {
        const d = new Date(date);
        const options: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Madrid' };
        return (
            <span suppressHydrationWarning className="flex flex-col">
                <span className="text-white/80">{d.toLocaleDateString('es-ES', options)}</span>
                <span className="text-3xs text-accent/60">{d.toLocaleTimeString('es-ES', { ...options, hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            </span>
        );
    } catch { return <span className="opacity-20">--/--/---- --:--:--</span>; }
};

export default function FinancialReportsClient({
    paginatedData,
    totalRecords,
    stats,
    services,
    initialParams
}: FinancialReportsClientProps) {
    const t = useTranslations('staff_panel.financials');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for UI inputs (sync with props on mount/change)
    const [startDate, setStartDate] = useState(initialParams.startDate);
    const [endDate, setEndDate] = useState(initialParams.endDate);
    const [searchTerm, setSearchTerm] = useState(initialParams.search);
    const [statusFilter, setStatusFilter] = useState(initialParams.status);
    const [serviceFilter, setServiceFilter] = useState(initialParams.service);
    const [activeView, setActiveView] = useState(initialParams.view);

    const [mounted, setMounted] = useState(false);
    const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    useEffect(() => setMounted(true), []);

    // Effect to sync local state if URL changes externally or props update
    useEffect(() => {
        setStartDate(initialParams.startDate);
        setEndDate(initialParams.endDate);
        setSearchTerm(initialParams.search);
        setStatusFilter(initialParams.status);
        setServiceFilter(initialParams.service);
        setActiveView(initialParams.view);
    }, [initialParams]);

    // Update URL Helper
    const updateFilters = useCallback((updates: Partial<typeof initialParams>) => {
        const params = new URLSearchParams(searchParams);

        // Reset page to 1 on filter change usually, unless explicitly setting page
        if (!updates.page) params.set('page', '1');

        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== initialParams.search) {
                updateFilters({ search: searchTerm });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, updateFilters, initialParams.search]);

    const handleViewChange = (view: string) => {
        setActiveView(view);
        // Date logic is handled on server if we just pass 'view' param?
        // Or we set explicit dates here?
        // Server logic uses 'view' to determine defaults if dates are missing.
        // Let's just pass 'view' and clear dates to let server decide,
        // OR calculate dates here to fill the inputs immediately.

        // Better UX: Calculate dates here so inputs update immediately
        const getxoDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(d);
        const now = new Date();
        let s = '', e = getxoDate(now);

        if (view === 'today') s = e;
        else if (view === 'week') s = getxoDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
        else if (view === 'month') {
            const d = new Date(now); d.setDate(1); s = getxoDate(d);
        } else { // year
            const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            s = getxoDate(lastYear);
        }

        setStartDate(s);
        setEndDate(e);
        updateFilters({ view, startDate: s, endDate: e });
    };

    const handleSaveEdit = async (field: string, newValue: any, oldValue: any) => {
        if (!editingTx) return;
        setIsSaving(true);
        try {
            const response = await fetch(apiUrl('/api/admin/rentals/financials/update'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingTx.id,
                    field,
                    newValue,
                    oldValue
                })
            });

            if (response.ok) {
                setEditingTx(null);
                router.refresh(); // Reload server data
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'Failed to update'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Error del sistema.');
        } finally {
            setIsSaving(false);
        }
    };

    const hasHistory = (item: FinancialTransaction, field: string) => {
        return item.history?.some((h: any) => h.field_name === field);
    };

    const getHistoryForField = (item: FinancialTransaction, field: string) => {
        return item.history?.filter((h: any) => h.field_name === field) || [];
    };

    // Chart Data Preparation (Gap Filling)
    const chartData = useMemo(() => {
        if (!stats.daily_stats || stats.daily_stats.length === 0) return [];

        // Use stats directly, but maybe fill gaps if needed?
        // Since we are showing a specific range, getting daily stats for that range from server is cleaner.
        // The server returns only days with data. We might want to fill gaps for better visuals.

        const filledData: { label: string; amount: number; date: string }[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return stats.daily_stats.map(d => ({
            label: d.date,
            amount: d.amount,
            date: d.date
        }));

        const curr = new Date(start);
        const map = new Map(stats.daily_stats.map(s => [s.date, s.amount]));

        // Limit loop to avoid browser crash on huge ranges
        let loopCount = 0;
        while (curr <= end && loopCount < 1000) {
            const k = curr.toISOString().split('T')[0];
            const amount = map.get(k) || 0;
            const label = new Date(curr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

            filledData.push({ label, amount, date: k });
            curr.setDate(curr.getDate() + 1);
            loopCount++;
        }

        // If range is huge (monthly/yearly view with > 60 days), maybe aggregate for chart?
        // For now, simple daily bars.
        return filledData.length > 0 ? filledData : stats.daily_stats.map(d => ({
            label: d.date,
            amount: d.amount,
            date: d.date
        }));
    }, [stats.daily_stats, startDate, endDate]);

    const maxChartValue = useMemo(() => {
        if (chartData.length === 0) return 100;
        const amounts = chartData.map(d => d.amount);
        const max = Math.max(...amounts);
        return max > 0 ? max : 100;
    }, [chartData]);

    const CHART_H = 260;

    const exportToCSV = () => {
        // Export only current page because that's what we have
        if (paginatedData.length === 0) return;

        const headers = ['Fecha', 'Hora', 'Cliente', 'Servicio', 'Estado Pago', 'Monto (€)'];
        const rows = paginatedData.map(item => {
            const dateStr = item.fecha_pago || item.created_at || item.fecha_reserva;
            const d = new Date(dateStr as string);
            const options: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Madrid' };
            return [
                d.toLocaleDateString('es-ES', options),
                d.toLocaleTimeString('es-ES', { ...options, hour12: false }),
                `${item.profiles?.nombre || ''} ${item.profiles?.apellidos || ''}`.trim(),
                item.servicios_alquiler?.nombre_es || t('various'),
                item.estado_pago,
                parseAmount(item.monto_total)
            ];
        });

        const csvContent = [headers, ...rows]
            .map(e => e.join(";"))
            .join("\n");

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `informe_financiero_pagina_${initialParams.page}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-12 pb-32">
            {/* Filters Header */}
            <div className="flex flex-wrap items-end justify-between gap-8 p-10 glass-panel rounded-sm relative overflow-hidden">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {[{ id: 'today', label: t('today') }, { id: 'week', label: t('week') }, { id: 'month', label: t('month') }]
                                .map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => handleViewChange(btn.id)}
                                    className={`px-4 py-1.5 rounded-full text-3xs uppercase tracking-widest font-black transition-all ${activeView === btn.id ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white border border-white/5'}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleViewChange('year')}
                                className={`px-4 py-1.5 rounded-full text-3xs uppercase tracking-widest font-black transition-all ${activeView === 'year' ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white border border-white/5'}`}
                            >
                                {t('year')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 block font-black">{t('from')}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setActiveView('custom');
                                updateFilters({ startDate: e.target.value, view: 'custom' });
                            }}
                            className="bg-white/5 border border-white/10 p-3 rounded-sm text-sm outline-none focus:border-accent font-mono text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 block font-black">{t('to')}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setActiveView('custom');
                                updateFilters({ endDate: e.target.value, view: 'custom' });
                            }}
                            className="bg-white/5 border border-white/10 p-3 rounded-sm text-sm outline-none focus:border-accent font-mono text-white"
                        />
                    </div>
                    <div className="pt-6">
                        <div className="text-right">
                            <span className="text-technical text-accent block">{t('total_revenue')}</span>
                            <span className="text-4xl font-display text-white italic" suppressHydrationWarning>
                                {mounted ? stats.total_revenue.toLocaleString('es-ES') : '--'}€
                            </span>
                            <div className="text-[8px] text-white/20 font-mono mt-1 cursor-pointer" onClick={() => setShowDebug(!showDebug)}>
                                Showing {paginatedData.length} records (Total: {totalRecords})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             {/* Debug Panel */}
             {showDebug && (
                <div className="p-4 bg-black/50 font-mono text-3xs text-green-400 overflow-auto max-h-40 border border-green-500/20">
                    <div>Params: {JSON.stringify(initialParams)}</div>
                    <div>Daily Stats Points: {stats.daily_stats.length}</div>
                    <div>Page: {initialParams.page} / {Math.ceil(totalRecords / initialParams.limit)}</div>
                </div>
            )}

            {/* Chart Section */}
            <div className="glass-panel p-12 rounded-sm space-y-12">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-8">
                    <h3 className="text-2xl font-display text-white italic underline underline-offset-[12px] decoration-accent/30 decoration-1">{t('chart_title')}</h3>
                    <button
                        onClick={exportToCSV}
                        disabled={paginatedData.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent/5 hover:bg-accent/10 text-accent border border-accent/20 transition-all rounded-full text-3xs uppercase tracking-[0.2em] font-black disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        {t('download_report')} (Página Actual)
                    </button>
                </header>

                <div className="relative h-[300px] w-full flex items-end gap-1 group/chart border-b border-white/5 pb-2 overflow-x-auto custom-scrollbar">
                    {chartData.length > 0 ? chartData.map((d, i) => {
                        const barHeight = Math.max((d.amount / maxChartValue) * CHART_H, 4);
                        return (
                            <div
                                key={i}
                                className="min-w-[4px] flex-1 flex flex-col justify-end items-center group/bar h-full relative"
                                title={`${d.label}: ${d.amount.toLocaleString()}€`}
                            >
                                <div
                                    className="w-full bg-accent/40 border-t border-accent group-hover/bar:bg-accent/80 transition-all rounded-t-xs relative"
                                    style={{ height: `${barHeight}px` }}
                                >
                                     <div className="absolute top-[-28px] left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-3xs text-accent font-black font-mono whitespace-nowrap bg-nautical-black/80 px-2 py-1 rounded-sm z-50">
                                        {mounted ? d.amount.toLocaleString() : '...'}€
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="w-full h-full flex items-center justify-center italic text-white/10">
                            {t('no_data', { count: 0 })}
                        </div>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <h3 className="text-2xl font-display text-white italic">{t('trans_details')}</h3>

                    <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-sm border border-white/10">
                         {/* Search */}
                         <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('search_placeholder')}
                                className="bg-nautical-black/50 border border-white/10 px-4 py-2 rounded-sm text-2xs text-white outline-none focus:border-accent w-64 transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-black">{t('filter_status')}</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    updateFilters({ status: e.target.value });
                                }}
                                className="bg-nautical-black border border-white/10 text-2xs p-2 rounded-sm outline-none focus:border-accent"
                            >
                                <option value="all">TODOS</option>
                                <option value="pagado">PAGADO</option>
                                <option value="pendiente">PENDIENTE</option>
                            </select>
                        </div>

                        {/* Service Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-black">{t('filter_service')}</label>
                            <select
                                value={serviceFilter}
                                onChange={(e) => {
                                    setServiceFilter(e.target.value);
                                    updateFilters({ service: e.target.value });
                                }}
                                className="bg-nautical-black border border-white/10 text-2xs p-2 rounded-sm outline-none focus:border-accent max-w-[150px]"
                            >
                                <option value="all">TODOS</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.nombre_es}>{s.nombre_es}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-6 text-3xs uppercase tracking-widest text-white/40 font-black">{t('date')}</th>
                                <th className="py-6 text-3xs uppercase tracking-widest text-white/40 font-black">{t('client')}</th>
                                <th className="py-6 text-3xs uppercase tracking-widest text-white/40 font-black">{t('service')}</th>
                                <th className="py-6 text-3xs uppercase tracking-widest text-white/40 font-black">Cupón</th>
                                <th className="py-6 text-3xs uppercase tracking-widest text-white/40 font-black">{t('status_payment')}</th>
                                <th className="py-6 text-right text-3xs uppercase tracking-widest text-white/40 font-black">{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {paginatedData.length > 0 ? paginatedData.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors relative">
                                    <td className="py-6 text-sm font-mono text-white/60">
                                        <div className="flex items-center gap-2 group/cell">
                                            <ClientDate date={item.fecha_pago || item.created_at || item.fecha_reserva} />
                                            {hasHistory(item, 'fecha_pago') && <span className="text-orange-500 font-bold cursor-help">!</span>}
                                            <button onClick={() => setEditingTx({ ...item, _field: 'fecha_pago' })} className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <p className="text-white font-display italic text-lg">{item.profiles?.nombre} {item.profiles?.apellidos}</p>
                                    </td>
                                    <td className="py-6 text-sm text-white/40">
                                        {item.servicios_alquiler?.nombre_es || t('various')}
                                    </td>
                                    <td className="py-6 text-3xs font-mono text-white/40">
                                        {item.cupon_usado ? <span className="bg-accent/10 text-accent px-2 py-1 rounded-sm">{item.cupon_usado}</span> : '--'}
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-2 group/cell">
                                            <span className={`text-3xs uppercase tracking-tighter px-3 py-1 border rounded-full ${item.estado_pago === 'pagado' ? 'border-green-500/30 text-green-500' : 'border-accent/30 text-accent'}`}>
                                                {item.estado_pago}
                                            </span>
                                            <button onClick={() => setEditingTx({ ...item, _field: 'estado_pago' })} className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 group/cell">
                                            <span className="text-lg font-display text-white italic">{mounted ? parseAmount(item.monto_total).toLocaleString() : '--'}€</span>
                                            <button onClick={() => setEditingTx({ ...item, _field: 'monto_total' })} className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-white/10 italic">
                                        {t('no_records')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalRecords > 0 && (
                <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <button
                        onClick={() => updateFilters({ page: initialParams.page - 1 })}
                        disabled={initialParams.page <= 1}
                        className="px-6 py-2 border border-white/10 text-white/60 text-xs uppercase tracking-widest hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-white/40 font-mono">
                        Page {initialParams.page} of {Math.ceil(totalRecords / initialParams.limit)}
                    </span>
                    <button
                        onClick={() => updateFilters({ page: initialParams.page + 1 })}
                        disabled={initialParams.page >= Math.ceil(totalRecords / initialParams.limit)}
                        className="px-6 py-2 border border-white/10 text-white/60 text-xs uppercase tracking-widest hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Edit Modal (reused from original) */}
            <AccessibleModal
                isOpen={!!editingTx}
                onClose={() => setEditingTx(null)}
                title="Editar Transacción"
                maxWidth="max-w-md"
            >
                {editingTx && (
                    <div className="space-y-8 py-2">
                         <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-4">
                            <span className="text-3xs uppercase tracking-widest text-white/40 block mb-1">ID Transacción</span>
                            <p className="text-accent font-mono text-2xs truncate">{editingTx.id}</p>
                        </div>
                        {/* Fields logic simplified for brevity, assume similar structure to original */}
                         <div className="space-y-6">
                            {editingTx._field === 'fecha_pago' && (
                                <div className="space-y-3">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-black block">Nueva Fecha</label>
                                    <input
                                        type="datetime-local"
                                        defaultValue={(() => {
                                            const raw = editingTx.fecha_pago || editingTx.created_at;
                                            if (!raw) return '';
                                            const d = new Date(raw);
                                            const offset = d.getTimezoneOffset() * 60000;
                                            const localDate = new Date(d.getTime() - offset);
                                            return localDate.toISOString().slice(0, 16);
                                        })()}
                                        id="edit-fecha"
                                        className="w-full bg-nautical-black border border-white/10 p-4 text-white outline-none focus:border-accent rounded-xl font-mono text-sm"
                                    />
                                </div>
                            )}
                            {editingTx._field === 'monto_total' && (
                                <div className="space-y-3">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-black block">Nuevo Monto</label>
                                    <input type="number" step="0.01" defaultValue={editingTx.monto_total} id="edit-monto" className="w-full bg-nautical-black border border-white/10 p-4 text-white outline-none focus:border-accent rounded-xl font-mono text-2xl" />
                                </div>
                            )}
                            {editingTx._field === 'estado_pago' && (
                                <div className="space-y-3">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-black block">Nuevo Estado</label>
                                    <select defaultValue={editingTx.estado_pago} id="edit-estado" className="w-full bg-nautical-black border border-white/10 p-4 text-white outline-none focus:border-accent rounded-xl text-sm">
                                        <option value="pagado">PAGADO</option>
                                        <option value="pendiente">PENDIENTE</option>
                                        <option value="cancelado">CANCELADO</option>
                                        <option value="reembolsado">REEMBOLSADO</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-4 pt-8">
                                <button onClick={() => setEditingTx(null)} className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all rounded-xl font-black">Cancelar</button>
                                <button onClick={() => {
                                    const field = editingTx?._field;
                                    if (!field) return;
                                    let val: any;
                                    if (field === 'fecha_pago') {
                                         const d = (document.getElementById('edit-fecha') as HTMLInputElement)?.value;
                                         val = d ? new Date(d).toISOString() : null;
                                    }
                                    if (field === 'monto_total') val = parseFloat((document.getElementById('edit-monto') as HTMLInputElement)?.value || '0');
                                    if (field === 'estado_pago') val = (document.getElementById('edit-estado') as HTMLSelectElement)?.value;
                                    handleSaveEdit(field, val, editingTx[field]);
                                }} disabled={isSaving} className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase font-black tracking-[0.2em] hover:bg-white transition-all rounded-xl shadow-2xl disabled:opacity-50">
                                    {isSaving ? 'Guardando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AccessibleModal>
        </div>
    );
}
