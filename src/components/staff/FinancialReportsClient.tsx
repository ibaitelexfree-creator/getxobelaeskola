'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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

interface ChartPoint {
    date: string;
    amount: number;
}

interface FinancialReportsClientProps {
    initialData?: FinancialTransaction[]; // Made optional as we fetch client-side
    initialView?: 'today' | 'month' | 'year' | undefined | null;
    totalRecords?: number;
    error?: string | null;
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

export default function FinancialReportsClient({ initialData = [], initialView, totalRecords: initialTotal = 0, error: initialError = null }: FinancialReportsClientProps) {
    const t = useTranslations('staff_panel.financials');
    const searchParams = useSearchParams();
    const viewQuery = initialView || searchParams.get('view') || 'year';

    // -- State --
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(initialError);

    // Data State
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [totalRecords, setTotalRecords] = useState(initialTotal);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [rawChartData, setRawChartData] = useState<ChartPoint[]>([]);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeFilter, setActiveFilter] = useState(viewQuery);
    const [forceShowAll, setForceShowAll] = useState(false);

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');

    // Edit State
    const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    // -- Effects --

    useEffect(() => setMounted(true), []);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Initialize Dates based on Filter View
    useEffect(() => {
        if (forceShowAll) {
            setStartDate('');
            setEndDate('');
            return;
        }

        const getGetxoDate = (d: Date) => {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Europe/Madrid',
                year: 'numeric', month: '2-digit', day: '2-digit'
            }).format(d);
        };

        const now = new Date();
        let start = '', end = '';

        if (activeFilter === 'today') {
            start = end = getGetxoDate(now);
        } else if (activeFilter === 'week') {
            const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            start = getGetxoDate(lastWeek);
            end = getGetxoDate(now);
        } else if (activeFilter === 'month') {
            const getxoStr = getGetxoDate(now);
            const [y, m] = getxoStr.split('-');
            start = `${y}-${m}-01`;
            end = getxoStr;
        } else if (activeFilter === 'year') {
            const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            start = getGetxoDate(lastYear);
            end = getGetxoDate(now);
        }

        if (start && end) {
            setStartDate(start);
            setEndDate(end);
        }
    }, [activeFilter, forceShowAll]);

    // FETCH DATA
    const fetchData = useCallback(async () => {
        // If filters dictate dates but they aren't set yet, skip (unless forcing all)
        if (!forceShowAll && activeFilter !== 'custom' && !startDate) return;

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                startDate: startDate || '',
                endDate: endDate || '',
                status: statusFilter,
                service: serviceFilter === 'all' ? '' : serviceFilter, // API expects empty or specific
                search: debouncedSearch
            });

            const res = await fetch(apiUrl(`/api/admin/rentals/financials?${params.toString()}`));
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch');

            if (data.success) {
                setTransactions(data.transactions);
                setTotalRecords(data.meta.totalCount);
                setTotalRevenue(data.meta.totalRevenue);
                setRawChartData(data.meta.chartData);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, startDate, endDate, statusFilter, serviceFilter, debouncedSearch, forceShowAll, activeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // -- Helpers --

    const exportToCSV = () => {
        if (transactions.length === 0) return;
        // Logic for export - ideally we should download ALL filtered data from API,
        // but for now we export current page or we can add an endpoint for CSV.
        // For simplicity, we'll export the *current view* (pagination limit).
        // To do it properly, we'd need an API endpoint that returns CSV.
        // Alert user it's current page only.
        alert("Exporting current page only. For full export, implement server-side CSV generation.");

        const headers = ['Fecha', 'Hora', 'Cliente', 'Servicio', 'Estado Pago', 'Monto (€)'];
        const rows = transactions.map(item => {
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
        const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `informe_financiero_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                // Refresh data to get updated history
                fetchData();
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'Failed to update'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Error del sistema.');
        } finally {
            setIsSaving(false);
            setEditingTx(null);
        }
    };

    const hasHistory = (item: FinancialTransaction, field: string) => {
        return item.history?.some((h: any) => h.field_name === field);
    };

    const getHistoryForField = (item: FinancialTransaction, field: string) => {
        return item.history?.filter((h: any) => h.field_name === field) || [];
    };

    // -- Chart Logic (Client-side Aggregation of Light Data) --
    const chartData = useMemo(() => {
        // If we have raw chart points from API, use them.
        if (rawChartData.length === 0) return [];

        // Find min/max date from data if filters are wide
        const dates = rawChartData.map(d => new Date(d.date).getTime());
        const minDate = dates.length > 0 ? Math.min(...dates) : new Date().getTime();
        const maxDate = dates.length > 0 ? Math.max(...dates) : new Date().getTime();

        const effectiveStart = startDate ? new Date(startDate) : new Date(minDate);
        const effectiveEnd = endDate ? new Date(endDate) : new Date(maxDate);

        const diffMs = effectiveEnd.getTime() - effectiveStart.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const isHourly = diffDays < 1;
        const isMonthly = diffDays > 45;
        let monthStep = 1;

        const agg: Record<string, { label: string, amount: number, sortKey: string, dateObj: Date }> = {};

        // Generate Buckets
        if (isHourly) {
             for (let h = 0; h < 24; h++) {
                const k = `${h.toString().padStart(2, '0')}:00`;
                agg[k] = { label: k, amount: 0, sortKey: k, dateObj: new Date() };
            }
        } else if (isMonthly) {
            const curr = new Date(effectiveStart);
            curr.setDate(1); // Start of month
            const endCmp = new Date(effectiveEnd);

            while (curr <= endCmp || (curr.getMonth() === endCmp.getMonth() && curr.getFullYear() === endCmp.getFullYear())) {
                const k = `${curr.getFullYear()}-${(curr.getMonth() + 1).toString().padStart(2, '0')}`;
                const label = curr.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).toUpperCase();
                agg[k] = { label, amount: 0, sortKey: k, dateObj: new Date(curr) };
                curr.setMonth(curr.getMonth() + 1);
            }
        } else {
            // Daily
            const curr = new Date(effectiveStart);
            while (curr <= effectiveEnd) {
                const k = curr.toISOString().split('T')[0];
                const label = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                agg[k] = { label, amount: 0, sortKey: k, dateObj: new Date(curr) };
                curr.setDate(curr.getDate() + 1);
            }
        }

        // Fill Buckets
        rawChartData.forEach(pt => {
             const d = new Date(pt.date);
             let key = '';
             if (isHourly) {
                 const hourStr = new Intl.DateTimeFormat('en-GB', {
                    hour: '2-digit', hour12: false, timeZone: 'Europe/Madrid'
                }).format(d);
                key = `${hourStr}:00`;
             } else if (isMonthly) {
                // Simple Year-Month match
                const m = (d.getMonth() + 1).toString().padStart(2, '0');
                key = `${d.getFullYear()}-${m}`;
             } else {
                 key = d.toISOString().split('T')[0];
             }

             // Find closest bucket if exact match fails (e.g. slight timezone shifts)
             // For strict daily/monthly, direct lookup is usually fine with ISO strings
             if (agg[key]) {
                 agg[key].amount += pt.amount;
             }
        });

        return Object.values(agg).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    }, [rawChartData, startDate, endDate]);

    const maxChartValue = useMemo(() => {
        if (chartData.length === 0) return 100;
        const amounts = chartData.map(d => d.amount);
        const max = Math.max(...amounts);
        return max > 0 ? max : 100;
    }, [chartData]);

    const CHART_H = 260;
    const totalPages = Math.ceil(totalRecords / limit);

    return (
        <div className="space-y-12 pb-32">
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* 1. Interactive Filters Bridge */}
            <div className="flex flex-wrap items-end justify-between gap-8 p-10 glass-panel rounded-sm relative overflow-hidden">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {['today', 'week', 'month'].map(id => (
                                <button
                                    key={id}
                                    onClick={() => { setForceShowAll(false); setActiveFilter(id); setPage(1); }}
                                    className={`px-4 py-1.5 rounded-full text-3xs uppercase tracking-widest font-black transition-all ${activeFilter === id && !forceShowAll ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white border border-white/5'}`}
                                >
                                    {t(id)}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setForceShowAll(false); setActiveFilter('year'); setPage(1); }}
                                className={`px-4 py-1.5 rounded-full text-3xs uppercase tracking-widest font-black transition-all ${activeFilter === 'year' && !forceShowAll ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white border border-white/5'}`}
                            >
                                {t('year')}
                            </button>
                            <button
                                onClick={() => { setForceShowAll(prev => !prev); setPage(1); }}
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
                            onChange={(e) => { setStartDate(e.target.value); setActiveFilter('custom'); setForceShowAll(false); setPage(1); }}
                            className={`bg-white/5 border border-white/10 p-3 rounded-sm text-sm outline-none focus:border-accent font-mono text-white ${forceShowAll ? 'opacity-30 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 block font-black">{t('to')}</label>
                        <input
                            type="date"
                            value={endDate}
                            disabled={forceShowAll}
                            onChange={(e) => { setEndDate(e.target.value); setActiveFilter('custom'); setForceShowAll(false); setPage(1); }}
                            className={`bg-white/5 border border-white/10 p-3 rounded-sm text-sm outline-none focus:border-accent font-mono text-white ${forceShowAll ? 'opacity-30 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    <div className="pt-6">
                        <div className="text-right">
                            <span className="text-technical text-accent block">{t('total_revenue')}</span>
                            <span className="text-4xl font-display text-white italic" suppressHydrationWarning>
                                {mounted ? totalRevenue.toLocaleString('es-ES') : '--'}€
                            </span>
                             <div className="text-[8px] text-white/20 font-mono mt-1 cursor-pointer" onClick={() => setShowDebug(!showDebug)}>
                                Found {totalRecords} records
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             {/* Debug Panel */}
             {showDebug && (
                <div className="p-4 bg-black/50 font-mono text-3xs text-green-400 overflow-auto max-h-40 border border-green-500/20">
                    <div>DB Total: {totalRecords}</div>
                    <div>Page Size: {limit}</div>
                    <div>Current Page: {page}</div>
                    <div>API Filter Range: {startDate} to {endDate}</div>
                    <div>Search: {debouncedSearch}</div>
                </div>
            )}

            {/* 2. Chart Section */}
            <div className="glass-panel p-12 rounded-sm space-y-12">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-8">
                    <h3 className="text-2xl font-display text-white italic underline underline-offset-[12px] decoration-accent/30 decoration-1">{t('chart_title')}</h3>
                    <button onClick={exportToCSV} className="text-accent border border-accent/20 px-4 py-2 rounded-full text-xs uppercase hover:bg-accent/10 transition-all">Download CSV (Page)</button>
                </header>

                <div className="relative h-[300px] w-full flex items-end gap-2 group/chart border-b border-white/5 pb-2">
                    {isLoading && chartData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center italic text-white/10 animate-pulse">Loading Chart...</div>
                    ) : chartData.length > 0 ? chartData.map((d, i) => {
                        const barHeight = Math.max((d.amount / maxChartValue) * CHART_H, 4);
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end items-center group/bar h-full relative" title={`${d.label}: ${d.amount}€`}>
                                <div className="w-full bg-accent/40 border-t-2 border-accent group-hover/bar:bg-accent/80 transition-all" style={{ height: `${barHeight}px` }}></div>
                            </div>
                        )
                    }) : (
                        <div className="w-full h-full flex items-center justify-center italic text-white/10">No data for chart</div>
                    )}
                </div>
            </div>

            {/* 3. Transaction Details Table */}
            <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <h3 className="text-2xl font-display text-white italic">{t('trans_details')}</h3>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-sm border border-white/10">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                placeholder={t('search_placeholder')}
                                className="bg-nautical-black/50 border border-white/10 px-4 py-2 rounded-sm text-2xs text-white outline-none focus:border-accent w-64 transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-nautical-black border border-white/10 text-2xs p-2 rounded-sm outline-none focus:border-accent"
                        >
                            <option value="all">TODOS</option>
                            <option value="pagado">PAGADO</option>
                            <option value="pendiente">PENDIENTE</option>
                        </select>
                        {/* Service Filter (Text Input or Predefined if passed, keeping simple text for now or we need to fetch services) */}
                        <div className="relative">
                             <input
                                type="text"
                                placeholder="Service Filter..."
                                value={serviceFilter === 'all' ? '' : serviceFilter}
                                onChange={(e) => { setServiceFilter(e.target.value || 'all'); setPage(1); }}
                                className="bg-nautical-black/50 border border-white/10 px-4 py-2 rounded-sm text-2xs text-white outline-none focus:border-accent w-40"
                             />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="w-full h-64 flex items-center justify-center text-white/20 animate-pulse">Loading Transactions...</div>
                    ) : (
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
                                {transactions.length > 0 ? transactions.map((item) => (
                                    <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors relative">
                                        <td className="py-6 text-sm font-mono text-white/60">
                                            <div className="flex items-center gap-2 group/cell">
                                                <ClientDate date={item.fecha_pago || item.created_at || item.fecha_reserva} />
                                                 {hasHistory(item, 'fecha_pago') && <span className="text-orange-500 font-bold">!</span>}
                                                 <button onClick={() => setEditingTx({ ...item, _field: 'fecha_pago' })} className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent">
                                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                 </button>
                                            </div>
                                        </td>
                                        <td className="py-6"><p className="text-white font-display italic text-lg">{item.profiles?.nombre} {item.profiles?.apellidos}</p></td>
                                        <td className="py-6 text-sm text-white/40">{item.servicios_alquiler?.nombre_es || t('various')}</td>
                                        <td className="py-6 text-3xs font-mono text-white/40">{item.cupon_usado || '--'}</td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2 group/cell">
                                                <span className={`text-3xs uppercase tracking-tighter px-3 py-1 border rounded-full ${item.estado_pago === 'pagado' ? 'border-green-500/30 text-green-500' : 'border-accent/30 text-accent'}`}>{item.estado_pago}</span>
                                                <button onClick={() => setEditingTx({ ...item, _field: 'estado_pago' })} className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 group/cell">
                                                 {hasHistory(item, 'monto_total') && <span className="text-orange-500 font-bold">!</span>}
                                                 <span className="text-lg font-display text-white italic">{mounted ? parseAmount(item.monto_total).toLocaleString() : '--'}€</span>
                                                 <button onClick={() => setEditingTx({ ...item, _field: 'monto_total' })} className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="py-20 text-center text-white/10 italic">No records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                    <span className="text-3xs text-white/40 uppercase tracking-widest">
                        Page {page} of {totalPages || 1} ({totalRecords} items)
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="px-4 py-2 border border-white/10 text-white/60 hover:text-white text-2xs uppercase tracking-widest disabled:opacity-20"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                            className="px-4 py-2 border border-white/10 text-white/60 hover:text-white text-2xs uppercase tracking-widest disabled:opacity-20"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal - Reusing previous logic structure */}
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
                        {/* Fields (same as before) */}
                         {editingTx._field === 'fecha_pago' && (
                                <div className="space-y-3">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-black block">Nueva Fecha de Pago</label>
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
                                        className="w-full bg-nautical-black border border-white/10 p-4 text-white outline-none focus:border-accent rounded-xl font-mono text-sm"
                                        id="edit-fecha"
                                    />
                                </div>
                            )}

                            {editingTx._field === 'monto_total' && (
                                <div className="space-y-3">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-black block">Nuevo Monto (€)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingTx.monto_total}
                                            className="w-full bg-nautical-black border border-white/10 p-4 pr-12 text-white outline-none focus:border-accent rounded-xl font-mono text-2xl"
                                            id="edit-monto"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {editingTx._field === 'estado_pago' && (
                                <div className="space-y-3">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-black block">Nuevo Estado de Pago</label>
                                    <select
                                        defaultValue={editingTx.estado_pago}
                                        className="w-full bg-nautical-black border border-white/10 p-4 text-white outline-none focus:border-accent rounded-xl text-sm appearance-none cursor-pointer"
                                        id="edit-estado"
                                    >
                                        <option value="pagado">PAGADO</option>
                                        <option value="pendiente">PENDIENTE</option>
                                        <option value="cancelado">CANCELADO</option>
                                        <option value="reembolsado">REEMBOLSADO</option>
                                    </select>
                                </div>
                            )}

                             <div className="flex gap-4 pt-8">
                                <button onClick={() => setEditingTx(null)} className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-[0.2em] text-white/40 rounded-xl font-black">Cancelar</button>
                                <button
                                    onClick={() => {
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
                                    }}
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase font-black tracking-[0.2em] rounded-xl"
                                >
                                    {isSaving ? 'Guardando...' : 'Confirmar'}
                                </button>
                            </div>
                     </div>
                )}
            </AccessibleModal>
        </div>
    );
}
