'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';
import { parseAmount } from '@/lib/utils/financial';
import { FinancialReportsClientProps, FinancialTransaction } from './financials/types';
import { useFinancialData } from './financials/useFinancialData';
import FinancialFilterControls from './financials/FinancialFilterControls';
import FinancialChart from './financials/FinancialChart';
import FinancialTransactionTable from './financials/FinancialTransactionTable';
import FinancialEditModal from './financials/FinancialEditModal';

export default function FinancialReportsClient({ initialData, initialView, totalRecords = 0, error = null }: FinancialReportsClientProps) {
    const t = useTranslations('staff_panel.financials');

    // Use the custom hook for data management
    const {
        transactions, setTransactions,
        startDate, setStartDate,
        endDate, setEndDate,
        activeFilter, setActiveFilter,
        forceShowAll, setForceShowAll,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        serviceFilter, setServiceFilter,
        sortBy, setSortBy,
        mounted,
        uniqueServices,
        filteredData,
        totalRevenue,
        chartData,
        maxChartValue
    } = useFinancialData(initialData, initialView);

    // UI State that doesn't affect data processing
    const [showDebug, setShowDebug] = useState(false);
    const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    return (
        <div className="space-y-12 pb-32">
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* 1. Interactive Filters Bridge */}
            <FinancialFilterControls
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                forceShowAll={forceShowAll}
                setForceShowAll={setForceShowAll}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                totalRevenue={totalRevenue}
                mounted={mounted}
                filteredDataLength={filteredData.length}
                initialDataLength={initialData.length}
                totalRecords={totalRecords}
                showDebug={showDebug}
                setShowDebug={setShowDebug}
            />

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
            <FinancialChart
                chartData={chartData}
                maxChartValue={maxChartValue}
                mounted={mounted}
                exportToCSV={exportToCSV}
                filteredDataLength={filteredData.length}
                startDate={startDate}
            />

            {/* 3. Transaction Details Table */}
            <FinancialTransactionTable
                filteredData={filteredData}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                serviceFilter={serviceFilter}
                setServiceFilter={setServiceFilter}
                uniqueServices={uniqueServices}
                sortBy={sortBy}
                setSortBy={setSortBy}
                mounted={mounted}
                totalRevenue={totalRevenue}
                initialDataLength={initialData.length}
                totalRecords={totalRecords}
                startDate={startDate}
                endDate={endDate}
                setForceShowAll={setForceShowAll}
                setEditingTx={setEditingTx}
            />

            {/* Edit Modal Refactored with AccessibleModal */}
            <FinancialEditModal
                editingTx={editingTx}
                setEditingTx={setEditingTx}
                handleSaveEdit={handleSaveEdit}
                isSaving={isSaving}
            />
        </div>
    );
}
