import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';
import { parseAmount } from '@/lib/utils/financial';

export interface FinancialTransaction {
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

interface UseFinancialReportsProps {
    initialData: FinancialTransaction[];
    initialView?: 'today' | 'month' | 'year' | undefined | null;
}

interface ChartItem {
    label: string;
    amount: number;
    sortKey: string;
    dateObj: Date;
}

export function useFinancialReports({ initialData, initialView }: UseFinancialReportsProps) {
    const t = useTranslations('staff_panel.financials');
    const searchParams = useSearchParams();
    const viewQuery = initialView || searchParams.get('view') || 'year';

    const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialData);
    const [mounted, setMounted] = useState(false);

    // Filters State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(initialView || viewQuery);
    const [forceShowAll, setForceShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');

    // UI State
    const [showDebug, setShowDebug] = useState(false);
    const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTransactions(initialData);
    }, [initialData]);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (initialView) {
            setActiveFilter(initialView);
        }
    }, [initialView]);

    // Date Range Logic
    useEffect(() => {
        if (forceShowAll) return;

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

    // Unique Services
    const uniqueServices = useMemo(() => {
        const services = new Set<string>();
        transactions.forEach(item => {
            const name = item.servicios_alquiler?.nombre_es;
            if (name) services.add(name);
        });
        return Array.from(services).sort();
    }, [transactions]);

    // Filtered Data
    const filteredData = useMemo(() => {
        let base = transactions;

        // 1. Date Range Filter
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

        // 2. Search Filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            base = base.filter(item => {
                const clientName = `${item.profiles?.nombre || ''} ${item.profiles?.apellidos || ''}`.toLowerCase();
                const serviceName = (item.servicios_alquiler?.nombre_es || '').toLowerCase();
                return clientName.includes(q) || serviceName.includes(q);
            });
        }

        // 3. Status Filter
        if (statusFilter !== 'all') {
            base = base.filter(item => item.estado_pago === statusFilter);
        }

        // 4. Service Filter
        if (serviceFilter !== 'all') {
            base = base.filter(item => item.servicios_alquiler?.nombre_es === serviceFilter);
        }

        // 5. Sorting
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

    // Total Revenue
    const totalRevenue = useMemo(() => {
        return filteredData.reduce((acc, curr) => acc + parseAmount(curr.monto_total), 0);
    }, [filteredData]);

    // Chart Data
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

        const agg: Record<string, ChartItem> = {};

        const [sy, sm, sd] = effectiveStart.split('-').map(Number);
        const [ey, em, ed] = effectiveEnd.split('-').map(Number);

        if (!sy || !ey) return [];

        const start = new Date(Date.UTC(sy, sm - 1, sd));
        const end = new Date(Date.UTC(ey, em - 1, ed));

        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 365 * 10) return [];

        const isHourly = diffDays < 1;
        const isMonthly = diffDays > 45;
        let monthStep = 1;

        if (isHourly) {
            for (let h = 0; h < 24; h++) {
                const k = `${h.toString().padStart(2, '0')}:00`;
                agg[k] = { label: k, amount: 0, sortKey: k, dateObj: new Date() };
            }
        } else if (isMonthly) {
            const curr = new Date(start);
            curr.setUTCDate(1);

            while (curr <= end || (curr.getUTCMonth() === end.getUTCMonth() && curr.getUTCFullYear() === end.getUTCFullYear())) {
                const k = `${curr.getUTCFullYear()}-${(curr.getUTCMonth() + 1).toString().padStart(2, '0')}`;
                const dateForLabel = new Date(curr.getUTCFullYear(), curr.getUTCMonth(), 1);
                const label = dateForLabel.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).toUpperCase();

                agg[k] = { label, amount: 0, sortKey: k, dateObj: new Date(curr) };
                curr.setUTCMonth(curr.getUTCMonth() + monthStep);
            }
        } else {
            const curr = new Date(start);
            while (curr <= end) {
                const k = curr.toISOString().split('T')[0];
                const label = new Date(curr.getUTCFullYear(), curr.getUTCMonth(), curr.getUTCDate())
                    .toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                agg[k] = { label, amount: 0, sortKey: k, dateObj: new Date(curr) };
                curr.setUTCDate(curr.getUTCDate() + 1);
            }
        }

        filteredData.forEach(item => {
            const dateStr = item.fecha_pago || item.created_at || item.fecha_reserva;
            if (!dateStr) return;
            const rawDate = new Date(dateStr);

            if (isHourly) {
                const hourStr = new Intl.DateTimeFormat('en-GB', {
                    hour: '2-digit', hour12: false, timeZone: 'Europe/Madrid'
                }).format(rawDate);
                const key = `${hourStr}:00`;
                if (agg[key]) agg[key].amount += parseAmount(item.monto_total);
            } else if (isMonthly) {
                const aggValues = Object.values(agg).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
                let targetBucket: ChartItem | null = null;
                for (let i = aggValues.length - 1; i >= 0; i--) {
                    const bucketDate = aggValues[i].dateObj;
                    if (rawDate >= bucketDate) {
                        targetBucket = aggValues[i];
                        break;
                    }
                }
                if (targetBucket) {
                    targetBucket.amount += parseAmount(item.monto_total);
                } else if (aggValues.length > 0) {
                    // This case handles items slightly before the first bucket (edge case)
                    // Ensure we don't crash and assign to first bucket
                    const firstBucket = aggValues[0];
                    if (firstBucket) {
                         firstBucket.amount += parseAmount(item.monto_total);
                    }
                }
            } else {
                const isoLike = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit'
                }).format(rawDate);
                const key = isoLike;
                if (agg[key]) agg[key].amount += parseAmount(item.monto_total);
            }
        });

        return Object.values(agg).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [filteredData, startDate, endDate, forceShowAll]);

    // Max Chart Value
    const maxChartValue = useMemo(() => {
        if (chartData.length === 0) return 100;
        const amounts = chartData.map(d => d.amount);
        const max = Math.max(...amounts);
        return max > 0 ? max : 100;
    }, [chartData]);

    // Handle Save Edit
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
                const newHistoryEntry = {
                    id: `temp-${Date.now()}`,
                    reserva_id: editingTx.id,
                    created_at: new Date().toISOString(),
                    field_name: field,
                    old_value: String(oldValue),
                    new_value: String(newValue),
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

    return {
        // State
        transactions,
        activeFilter, setActiveFilter,
        startDate, setStartDate,
        endDate, setEndDate,
        forceShowAll, setForceShowAll,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        serviceFilter, setServiceFilter,
        sortBy, setSortBy,
        editingTx, setEditingTx,
        isSaving,
        showDebug, setShowDebug,
        mounted,

        // Derived
        uniqueServices,
        filteredData,
        totalRevenue,
        chartData,
        maxChartValue,

        // Actions
        handleSaveEdit
    };
}
