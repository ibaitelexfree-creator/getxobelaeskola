'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

interface FinancialReportsClientProps {
    initialData: FinancialTransaction[];
    initialView?: 'today' | 'month' | 'year' | undefined | null;
    totalRecords?: number;
    error?: string | null;
}

// Fixed Date formatter to prevent hydration mismatch (Forced to Getxo Time)
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

export default function FinancialReportsClient({ initialData, initialView, totalRecords = 0, error = null }: FinancialReportsClientProps) {
    const t = useTranslations('staff_panel.financials');
    const searchParams = useSearchParams();
    const viewQuery = initialView || searchParams.get('view') || 'year';

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const activeView = initialView || viewQuery;
    const [activeFilter, setActiveFilter] = useState(activeView);
    const [mounted, setMounted] = useState(false);

    // Use local state for data to allow instant UI updates
    const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialData);

    useEffect(() => {
        setTransactions(initialData);
    }, [initialData]);

    const [showDebug, setShowDebug] = useState(false);
    const [forceShowAll, setForceShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => setMounted(true), []);

    // Extract unique services for the filter
    const uniqueServices = useMemo(() => {
        const services = new Set<string>();
        transactions.forEach(item => {
            const name = item.servicios_alquiler?.nombre_es;
            if (name) services.add(name);
        });
        return Array.from(services).sort();
    }, [transactions]);

    useEffect(() => {
        if (forceShowAll) return; // Don't reset dates if forcing show all

        const getGetxoDate = (d: Date) => {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Europe/Madrid',
                year: 'numeric', month: '2-digit', day: '2-digit'
            }).format(d);
        };

        const now = new Date();
        if (activeFilter === 'today') {
            const todayStr = getGetxoDate(now);
            setStartDate(todayStr); setEndDate(todayStr);
        } else if (activeFilter === 'week') {
            const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            setStartDate(getGetxoDate(lastWeek));
            setEndDate(getGetxoDate(now));
        } else if (activeFilter === 'month') {
            const getxoStr = getGetxoDate(now);
            const [y, m] = getxoStr.split('-');
            setStartDate(`${y}-${m}-01`);
            setEndDate(getxoStr);
        } else if (activeFilter === 'year') {
            const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            setStartDate(getGetxoDate(lastYear));
            setEndDate(getGetxoDate(now));
        }
    }, [activeFilter, forceShowAll]);

    useEffect(() => {
        if (initialView) {
            setActiveFilter(initialView);
        }
    }, [initialView]);

    const filteredData = useMemo(() => {
        let base = transactions;

        // 1. Date Range Filter (Global)
        if (!forceShowAll && startDate && endDate) {
            base = base.filter(item => {
                const dateStr = item.fecha_pago || item.created_at || item.fecha_reserva;
                if (!dateStr) return false;
                const itemInGetxoStr = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Europe/Madrid',
                    year: 'numeric', month: '2-digit', day: '2-digit'
                }).format(new Date(dateStr));
                return itemInGetxoStr >= startDate && itemInGetxoStr <= endDate;
            });
        }

        // 2. Search Filter (Local)
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            base = base.filter(item => {
                const clientName = `${item.profiles?.nombre || ''} ${item.profiles?.apellidos || ''}`.toLowerCase();
                const serviceName = (item.servicios_alquiler?.nombre_es || '').toLowerCase();
                return clientName.includes(q) || serviceName.includes(q);
            });
        }

        // 3. Status Filter (Local)
        if (statusFilter !== 'all') {
            base = base.filter(item => item.estado_pago === statusFilter);
        }

        // 4. Service Filter (Local)
        if (serviceFilter !== 'all') {
            base = base.filter(item => item.servicios_alquiler?.nombre_es === serviceFilter);
        }

        // 5. Sorting (Local)
        return [...base].sort((a, b) => {
            if (sortBy === 'date_desc' || sortBy === 'date_asc') {
                const dateA = new Date(a.fecha_pago || a.created_at || a.fecha_reserva || 0).getTime();
                const dateB = new Date(b.fecha_pago || b.created_at || b.fecha_reserva || 0).getTime();
                return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
            } else if (sortBy === 'amount_desc' || sortBy === 'amount_asc') {
                const amtA = parseAmount(a.monto_total);
                const amtB = parseAmount(b.monto_total);
                return sortBy === 'amount_desc' ? amtB - amtA : amtA - amtB;
            }
            return 0;
        });
    }, [transactions, startDate, endDate, forceShowAll, searchTerm, statusFilter, serviceFilter, sortBy]);

    const totalRevenue = useMemo(() => {
        return filteredData.reduce((acc, curr) => acc + parseAmount(curr.monto_total), 0);
    }, [filteredData]);

    const exportToCSV = () => {
        if (filteredData.length === 0) return;

        // Header for CSV
        const headers = ['Fecha', 'Hora', 'Cliente', 'Servicio', 'Estado Pago', 'Monto (€)'];

        // Data mapping (Forced to Getxo Time)
        const rows = filteredData.map(item => {
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
            .map(e => e.join(";")) // Use semicolon for better Excel compatibility in many regions
            .join("\n");

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
                // Update local state optimistically or with API data if we had it
                // We'll create a mock history entry for immediate feedback
                const newHistoryEntry = {
                    id: `temp-${Date.now()}`,
                    reserva_id: editingTx.id,
                    created_at: new Date().toISOString(),
                    field_name: field,
                    old_value: String(oldValue),
                    new_value: String(newValue),
                    // We don't have the profile here easily without context, but user knows they did it
                    profiles: { nombre: 'Yo', apellidos: '(Ahora)' }
                };

                setTransactions(prev => prev.map(item => {
                    if (item.id === editingTx.id) {
                        return {
                            ...item,
                            [field]: newValue,
                            history: [...(item.history || []), newHistoryEntry]
                        };
                    }
                    return item;
                }));

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

    // Data for the simple chart (Smart Aggregation with GAP FILLING)
    const chartData = useMemo(() => {
        let effectiveStart = startDate;
        let effectiveEnd = endDate;

        if (forceShowAll && filteredData.length > 0) {
            const dates = filteredData.map(d => new Date(d.fecha_pago || d.created_at || d.fecha_reserva || '').getTime()).filter(t => !isNaN(t));

            if (dates.length > 0) {
                const min = Math.min(...dates);
                const max = Math.max(...dates);
                effectiveStart = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(min));
                effectiveEnd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(max));
            }
        }

        if (!effectiveStart || !effectiveEnd) return [];

        const agg: Record<string, { label: string, amount: number, sortKey: string, dateObj: Date } | null> = {};

        const [sy, sm, sd] = effectiveStart.split('-').map(Number);
        const [ey, em, ed] = effectiveEnd.split('-').map(Number);

        // Sanity check
        if (!sy || !ey) return [];

        const start = new Date(Date.UTC(sy, sm - 1, sd));
        const end = new Date(Date.UTC(ey, em - 1, ed));

        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const diffMonths = (ey - sy) * 12 + (em - sm);

        // Protect against massive loops if date range is bogus
        if (diffDays > 365 * 10) return []; // Increased limit for long history

        const isHourly = diffDays < 1;
        // Determine granularity
        // If range > 45 days, we switch to Monthly
        // If range is huge (e.g. 6 years = 72 months), we aggregate
        const isMonthly = diffDays > 45;

        let monthStep = 1;
        // User requested strict "one bar per month" for "Todos los datos"

        if (isHourly) {
            for (let h = 0; h < 24; h++) {
                const k = `${h.toString().padStart(2, '0')}:00`;
                agg[k] = { label: k, amount: 0, sortKey: k, dateObj: new Date() }; // DateObj dummy
            }
        } else if (isMonthly) {
            const curr = new Date(start);
            // Align start to beginning of month for cleaner steps
            curr.setUTCDate(1);

            while (curr <= end || (curr.getUTCMonth() === end.getUTCMonth() && curr.getUTCFullYear() === end.getUTCFullYear())) {
                const k = `${curr.getUTCFullYear()}-${(curr.getUTCMonth() + 1).toString().padStart(2, '0')}`;
                const dateForLabel = new Date(curr.getUTCFullYear(), curr.getUTCMonth(), 1);

                // If step > 1, label might need to indicate range or just the start month
                // User logic: "mostrar 12 meses... y otras veces... cada dos meses" implies just bars every 2 months
                const label = dateForLabel.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).toUpperCase();

                agg[k] = {
                    label,
                    amount: 0,
                    sortKey: k,
                    dateObj: new Date(curr)
                };

                curr.setUTCMonth(curr.getUTCMonth() + monthStep);
            }
        } else {
            // Daily
            const curr = new Date(start);
            while (curr <= end) {
                const k = curr.toISOString().split('T')[0];
                const label = new Date(curr.getUTCFullYear(), curr.getUTCMonth(), curr.getUTCDate())
                    .toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                agg[k] = {
                    label,
                    amount: 0,
                    sortKey: k,
                    dateObj: new Date(curr)
                };
                curr.setUTCDate(curr.getUTCDate() + 1);
            }
        }

        // Fill Data
        filteredData.forEach(item => {
            const dateStr = item.fecha_pago || item.created_at || item.fecha_reserva;
            if (!dateStr) return;
            const rawDate = new Date(dateStr);

            let key = "";
            if (isHourly) {
                const hourStr = new Intl.DateTimeFormat('en-GB', {
                    hour: '2-digit', hour12: false, timeZone: 'Europe/Madrid'
                }).format(rawDate);
                key = `${hourStr}:00`;
                if (agg[key]) agg[key]!.amount += parseAmount(item.monto_total);
            } else if (isMonthly) {
                // Find correct bucket
                // We need to match rawDate to one of our generated buckets
                // Buckets are generated with monthStep.
                // We can iterate buckets to find the one that covers this date.
                // Buckets are sorted by date.

                // Easier: just loop through agg keys (which are YYYY-MM) and find the best fit

                const aggValues = Object.values(agg).sort((a, b) => ((a && a.dateObj) ? a.dateObj.getTime() : 0) - ((b && b.dateObj) ? b.dateObj.getTime() : 0));

                // Find the bucket where bucketDate <= itemDate < nextBucketDate
                // Note: rawDate needs to be reasonably compared.
                // Let's rely on UTC components for comparison to match bucket generation

                // Convert rawDate to UTC start-of-month for comparison
                // (Approximation is fine for visualisation)
                const itemTime = rawDate.getTime();

                let targetBucket: any = null;
                for (let i = aggValues.length - 1; i >= 0; i--) {
                    // Compare year/month
                    const bucketDate = aggValues[i]!.dateObj;

                    // Check if item is after or in the same month as bucket
                    if (rawDate >= bucketDate) {
                        targetBucket = aggValues[i];
                        break;
                    }

                    // Special case: if item is slightly before the first bucket due to timezone/day diffs but belongs to it?
                    // Strictly speaking, logic should be robust.
                    // If we are aggregating by 2 months: Jan, Mar, May...
                    // Feb data should go to Jan or Feb?
                    // "Cada dos meses" -> usually means [Jan, Feb] -> Jan Bar. [Mar, Apr] -> Mar Bar.
                    // So find the largest bucket date <= item date.
                }

                if (targetBucket) {
                    targetBucket!.amount += parseAmount(item.monto_total);
                } else if (aggValues.length > 0) {
                    // Add to first bucket if earlier (shouldn't happen with correct loop, but safety)
                    aggValues[0]!.amount += parseAmount(item.monto_total);
                }

            } else {
                // Daily
                const isoLike = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit'
                }).format(rawDate);
                key = isoLike;
                if (agg[key]) agg[key]!.amount += parseAmount(item.monto_total);
            }
        });

        const aggValues = Object.values(agg); return aggValues.sort((a, b) => ((a && a.dateObj) ? a.dateObj.getTime() : 0) - ((b && b.dateObj) ? b.dateObj.getTime() : 0));
    }, [filteredData, startDate, endDate, forceShowAll]);

    const maxChartValue = useMemo(() => {
        if (chartData.length === 0) return 100;
        const amounts = chartData.map(d => d?.amount || 0);
        const max = Math.max(...amounts, 0);
        return max > 0 ? max : 100;
    }, [chartData]);

    const CHART_H = 260;

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
                                Showing {filteredData.length} records (Loaded: {initialData.length}, DB: {totalRecords})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug Panel */}
            {showDebug && (
                <div className="p-4 bg-black/50 font-mono text-3xs text-green-400 overflow-auto max-h-40 border border-green-500/20">
                    <div>DB Status: {totalRecords > 0 ? 'HAS DATA' : 'EMPTY or UNKNOWN'}</div>
                    <div>API Loaded: {initialData.length} items</div>
                    <div>Filtered: {filteredData.length} items</div>
                    <div>Filter Range: {startDate} to {endDate}</div>
                    <div>First Raw Created At: {initialData[0]?.created_at || 'N/A'}</div>
                    <div>First Raw Reserva Date: {initialData[0]?.fecha_reserva || 'N/A'}</div>
                    <div>First Raw Hora Inicio: {initialData[0]?.hora_inicio || 'N/A'}</div>
                </div>
            )}

            {/* 2. Premium Visualization Section */}
            <div className="glass-panel p-12 rounded-sm space-y-12">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-8">
                    <h3 className="text-2xl font-display text-white italic underline underline-offset-[12px] decoration-accent/30 decoration-1">{t('chart_title')}</h3>

                    <button
                        onClick={exportToCSV}
                        disabled={filteredData.length === 0}
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
                        const barHeight = Math.max(((d?.amount || 0) / maxChartValue) * CHART_H, 4);
                        return (
                            <div
                                key={i}
                                className="flex-1 flex flex-col justify-end items-center group/bar h-full relative"
                                title={`${d?.label}: ${(d?.amount || 0).toLocaleString()}€`}
                            >
                                <div
                                    className="w-full bg-accent/40 border-t-2 border-accent group-hover/bar:bg-accent/80 transition-all duration-500 rounded-t-xs relative shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]"
                                    style={{ height: `${barHeight}px` }}
                                >
                                    <div className="absolute top-[-28px] left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-3xs text-accent font-black font-mono whitespace-nowrap bg-nautical-black/80 px-2 py-1 rounded-sm">
                                        {mounted ? (d?.amount || 0).toLocaleString() : '...'}€
                                    </div>
                                </div>
                                <span className="absolute bottom-[-32px] text-3xs text-white/30 font-mono -rotate-45 origin-right lg:rotate-0 lg:origin-center group-hover/bar:text-accent transition-colors tracking-tighter">
                                    {d?.label}
                                </span>
                            </div>
                        );
                    }) : startDate ? (
                        <div className="w-full h-full border border-dashed border-white/5 flex items-center justify-center italic text-white/10 text-sm">
                            {t('no_data', { count: filteredData.length })}
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

            {/* 3. Transaction Details Table */}
            <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <h3 className="text-2xl font-display text-white italic">{t('trans_details')}</h3>

                    {/* Advanced Table Filters */}
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
                                onChange={(e) => setStatusFilter(e.target.value)}
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
                                onChange={(e) => setServiceFilter(e.target.value)}
                                className="bg-nautical-black border border-white/10 text-2xs p-2 rounded-sm outline-none focus:border-accent max-w-[150px]"
                            >
                                <option value="all">TODOS</option>
                                {uniqueServices.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sorting */}
                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-black">{t('sort_by')}</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-nautical-black border border-white/10 text-2xs p-2 rounded-sm outline-none focus:border-accent"
                            >
                                <option value="date_desc">{t('sort_date_desc')}</option>
                                <option value="date_asc">{t('sort_date_asc')}</option>
                                <option value="amount_desc">{t('sort_amount_desc')}</option>
                                <option value="amount_asc">{t('sort_amount_asc')}</option>
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
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors relative">
                                    <td className="py-6 text-sm font-mono text-white/60">
                                        <div className="flex items-center gap-2 group/cell">
                                            <ClientDate date={item.fecha_pago || item.created_at || item.fecha_reserva} />
                                            {hasHistory(item, 'fecha_pago') && (
                                                <div className="relative group/hist">
                                                    <span className="text-orange-500 font-bold cursor-help animate-pulse">!</span>
                                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/hist:block z-50 w-64 p-3 bg-nautical-deep border border-white/10 rounded-lg shadow-2xl glass-panel">
                                                        <p className="text-3xs uppercase tracking-tighter text-white/40 mb-2 border-b border-white/5 pb-1">Historial de fecha</p>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                            {getHistoryForField(item, 'fecha_pago').map((h: any) => (
                                                                <div key={h.id} className="text-3xs border-l border-accent/20 pl-2">
                                                                    <div className="flex justify-between text-white/30">
                                                                        <span>
                                                                            {new Date(h.created_at).toLocaleString('es-ES', {
                                                                                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                                                                                timeZone: 'Europe/Madrid'
                                                                            })}
                                                                        </span>
                                                                        <span>{h.profiles?.nombre}</span>
                                                                    </div>
                                                                    <div className="text-white/60 line-through truncate">
                                                                        {(() => {
                                                                            try { return new Date(h.old_value).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }); }
                                                                            catch { return h.old_value; }
                                                                        })()}
                                                                    </div>
                                                                    <div className="text-accent">
                                                                        {(() => {
                                                                            try { return new Date(h.new_value).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }); }
                                                                            catch { return h.new_value; }
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setEditingTx({ ...item, _field: 'fecha_pago' })}
                                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent transition-all"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <p className="text-white font-display italic text-lg">{item.profiles?.nombre} {item.profiles?.apellidos}</p>
                                    </td>
                                    <td className="py-6 text-sm text-white/40">
                                        <div className="flex items-center gap-2 group/cell">
                                            {item.servicios_alquiler?.nombre_es || t('various')}
                                            {hasHistory(item, 'servicio_id') && (
                                                <div className="relative group/hist">
                                                    <span className="text-orange-500 font-bold cursor-help animate-pulse">!</span>
                                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/hist:block z-50 w-64 p-3 bg-nautical-deep border border-white/10 rounded-lg shadow-2xl glass-panel">
                                                        <p className="text-3xs uppercase tracking-tighter text-white/40 mb-2 border-b border-white/5 pb-1">Historial de servicio</p>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                            {getHistoryForField(item, 'servicio_id').map((h: any) => (
                                                                <div key={h.id} className="text-3xs border-l border-accent/20 pl-2">
                                                                    <div className="flex justify-between text-white/30">
                                                                        <span>{new Date(h.created_at).toLocaleDateString()}</span>
                                                                        <span>{h.profiles?.nombre}</span>
                                                                    </div>
                                                                    <div className="text-white/60 line-through truncate">{h.old_value}</div>
                                                                    <div className="text-accent">{h.new_value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 text-3xs font-mono text-white/40">
                                        {item.cupon_usado ? (
                                            <span className="bg-accent/10 text-accent px-2 py-1 rounded-sm border border-accent/20">
                                                {item.cupon_usado}
                                            </span>
                                        ) : '--'}
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-2 group/cell">
                                            <span className={`text-3xs uppercase tracking-tighter px-3 py-1 border rounded-full ${item.estado_pago === 'pagado' ? 'border-green-500/30 text-green-500' : 'border-accent/30 text-accent'}`}>
                                                {item.estado_pago}
                                            </span>
                                            {hasHistory(item, 'estado_pago') && (
                                                <div className="relative group/hist">
                                                    <span className="text-orange-500 font-bold cursor-help animate-pulse">!</span>
                                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/hist:block z-50 w-64 p-3 bg-nautical-deep border border-white/10 rounded-lg shadow-2xl glass-panel">
                                                        <p className="text-3xs uppercase tracking-tighter text-white/40 mb-2 border-b border-white/5 pb-1">Historial de estado</p>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                            {getHistoryForField(item, 'estado_pago').map((h: any) => (
                                                                <div key={h.id} className="text-3xs border-l border-accent/20 pl-2">
                                                                    <div className="flex justify-between text-white/30">
                                                                        <span>{new Date(h.created_at).toLocaleDateString()}</span>
                                                                        <span>{h.profiles?.nombre}</span>
                                                                    </div>
                                                                    <div className="text-white/60 line-through truncate">{h.old_value}</div>
                                                                    <div className="text-accent">{h.new_value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setEditingTx({ ...item, _field: 'estado_pago' })}
                                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent transition-all"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 group/cell">
                                            {hasHistory(item, 'monto_total') && (
                                                <div className="relative group/hist">
                                                    <span className="text-orange-500 font-bold cursor-help animate-pulse">!</span>
                                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover/hist:block z-50 w-64 p-3 bg-nautical-deep border border-white/10 rounded-lg shadow-2xl glass-panel">
                                                        <p className="text-3xs uppercase tracking-tighter text-white/40 mb-2 border-b border-white/5 pb-1">Historial de monto</p>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                            {getHistoryForField(item, 'monto_total').map((h: any) => (
                                                                <div key={h.id} className="text-3xs border-l border-accent/20 pl-2 text-right">
                                                                    <div className="flex justify-between text-white/30 gap-4">
                                                                        <span>{new Date(h.created_at).toLocaleDateString()}</span>
                                                                        <span>{h.profiles?.nombre}</span>
                                                                    </div>
                                                                    <div className="text-white/60 line-through">{h.old_value}€</div>
                                                                    <div className="text-accent">{h.new_value}€</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <span className="text-lg font-display text-white italic">{mounted ? (item.monto_total || 0).toLocaleString() : '--'}€</span>
                                            <button
                                                onClick={() => setEditingTx({ ...item, _field: 'monto_total' })}
                                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:text-accent transition-all"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-white/10 italic">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="text-lg">{t('no_records')}</span>

                                            {/* Advanced Diagnostics */}
                                            <div className="text-2xs text-left bg-white/5 p-4 rounded border border-white/10 space-y-2 max-w-md">
                                                <div className={`font-bold ${totalRecords > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    Database Status: {totalRecords} total records found.
                                                </div>
                                                <div className={`${initialData.length > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                                                    Loaded in Browser: {initialData.length} records.
                                                </div>
                                                {initialData.length > 0 && filteredData.length === 0 && (
                                                    <div className="text-orange-400">
                                                        Warning: {initialData.length} records are hidden by the current date filter ({startDate} to {endDate}).
                                                        <br />
                                                        <button onClick={() => setForceShowAll(true)} className="mt-2 text-accent underline">
                                                            Click here to FORCE SHOW ALL DATA
                                                        </button>
                                                    </div>
                                                )}
                                                {totalRecords > 0 && initialData.length === 0 && (
                                                    <div className="text-red-400">
                                                        CRITICAL: Database has records, but API returned 0. This suggests an API limit or Permission issue.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-white/10 bg-white/[0.01]">
                                <td colSpan={5} className="py-8 text-right pr-6">
                                    <span className="text-3xs uppercase tracking-[0.3em] font-black text-white/20">{t('total_sum')}</span>
                                </td>
                                <td className="py-8 text-right">
                                    <span className="text-3xl font-display text-accent italic">
                                        {mounted ? totalRevenue.toLocaleString() : '--'}€
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Edit Modal Refactored with AccessibleModal */}
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

                        <div className="space-y-6">
                            {editingTx._field === 'fecha_pago' && (
                                <div className="space-y-3">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-black block">Nueva Fecha de Pago</label>
                                    <input
                                        type="datetime-local"
                                        defaultValue={(() => {
                                            const raw = editingTx.fecha_pago || editingTx.created_at;
                                            if (!raw) return '';
                                            const d = new Date(raw);
                                            // Adjust to local time timezone offset to make input show the correct "absolute" time
                                            const offset = d.getTimezoneOffset() * 60000;
                                            const localDate = new Date(d.getTime() - offset);
                                            return localDate.toISOString().slice(0, 16);
                                        })()}
                                        className="w-full bg-nautical-black border border-white/10 p-4 text-white outline-none focus:border-accent rounded-xl font-mono text-sm"
                                        id="edit-fecha"
                                    />
                                    <p className="text-3xs text-white/30 italic">La fecha se guardará en formato UTC.</p>
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
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xl font-display italic">€</span>
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
                                        <option value="pagado">PAGADO (Confirmado)</option>
                                        <option value="pendiente">PENDIENTE (Pendiente de cobro)</option>
                                        <option value="cancelado">CANCELADO (Anulado)</option>
                                        <option value="reembolsado">REEMBOLSADO (Devuelto)</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4 pt-8">
                                <button
                                    onClick={() => setEditingTx(null)}
                                    className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all rounded-xl font-black hover:bg-white/5"
                                >
                                    Cancelar
                                </button>
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
                                    className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase font-black tracking-[0.2em] hover:bg-white transition-all rounded-xl shadow-2xl disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : 'Confirmar Cambio'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AccessibleModal>
        </div>
    );
}
