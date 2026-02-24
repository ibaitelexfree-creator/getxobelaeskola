'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';
import { parseAmount } from '@/lib/utils/financial';
import { FinancialTransaction, FinancialReportsClientProps, ChartDataPoint } from './financials/types';
import FinancialReportsToolbar from './financials/FinancialReportsToolbar';
import FinancialReportsChart from './financials/FinancialReportsChart';
import FinancialReportsTable from './financials/FinancialReportsTable';
import FinancialTransactionModal from './financials/FinancialTransactionModal';

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
    const chartData = useMemo<ChartDataPoint[]>(() => {
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

        const agg: Record<string, { label: string, amount: number, sortKey: string, dateObj: Date }> = {};

        const [sy, sm, sd] = effectiveStart.split('-').map(Number);
        const [ey, em, ed] = effectiveEnd.split('-').map(Number);

        // Sanity check
        if (!sy || !ey) return [];

        const start = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        let mode: 'day' | 'month' | 'year' = 'day';
        if (diffDays > 365) mode = 'year';
        else if (diffDays > 60) mode = 'month';

        // Pre-fill buckets
        const curr = new Date(start);
        while (curr <= end) {
            let key = '';
            let label = '';
            const y = curr.getFullYear();
            const m = curr.getMonth() + 1;
            const d = curr.getDate();

            if (mode === 'day') {
                key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                label = `${d}/${m}`;
                curr.setDate(curr.getDate() + 1);
            } else if (mode === 'month') {
                key = `${y}-${String(m).padStart(2, '0')}`;
                label = `${m}/${String(y).slice(2)}`;
                curr.setMonth(curr.getMonth() + 1);
            } else {
                key = `${y}`;
                label = `${y}`;
                curr.setFullYear(curr.getFullYear() + 1);
            }
            agg[key] = { label, amount: 0, sortKey: key, dateObj: new Date(curr) }; // Use curr which is already incremented, but key is correct
        }

        filteredData.forEach(item => {
            const dateStr = item.fecha_pago || item.created_at || item.fecha_reserva;
            if (!dateStr) return;
            const d = new Date(dateStr);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const day = d.getDate();
            const amt = parseAmount(item.monto_total);

            let key = '';
            if (mode === 'day') key = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            else if (mode === 'month') key = `${y}-${String(m).padStart(2, '0')}`;
            else key = `${y}`;

            if (agg[key]) agg[key].amount += amt;
        });

        return Object.values(agg).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [filteredData, startDate, endDate, forceShowAll]);

    const maxChartValue = useMemo(() => {
        const amounts = chartData.map(d => d.amount);
        const max = Math.max(...amounts);
        return max > 0 ? max : 100;
    }, [chartData]);

    const CHART_H = 260;

    return (
        <div className="space-y-12 pb-32">
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-sm">
                    {error}
                </div>
            )}

            <FinancialReportsToolbar
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                forceShowAll={forceShowAll}
                setForceShowAll={setForceShowAll}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                totalRevenue={totalRevenue}
                filteredDataLength={filteredData.length}
                initialDataLength={initialData.length}
                totalRecords={totalRecords}
                showDebug={showDebug}
                setShowDebug={setShowDebug}
                mounted={mounted}
            />

            <FinancialReportsChart
                chartData={chartData}
                maxChartValue={maxChartValue}
                CHART_H={CHART_H}
                startDate={startDate}
                filteredData={filteredData}
                exportToCSV={exportToCSV}
                mounted={mounted}
            />

            <FinancialReportsTable
                transactions={filteredData}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setEditingTx={setEditingTx}
                hasHistory={hasHistory}
                getHistoryForField={getHistoryForField}
                mounted={mounted}
                totalRecords={totalRecords}
                initialData={initialData}
                forceShowAll={forceShowAll}
                setForceShowAll={setForceShowAll}
                startDate={startDate}
                endDate={endDate}
                totalRevenue={totalRevenue}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                serviceFilter={serviceFilter}
                setServiceFilter={setServiceFilter}
                uniqueServices={uniqueServices}
            />

            <FinancialTransactionModal
                editingTx={editingTx}
                setEditingTx={setEditingTx}
                handleSaveEdit={handleSaveEdit}
                isSaving={isSaving}
            />
        </div>
    );
}
