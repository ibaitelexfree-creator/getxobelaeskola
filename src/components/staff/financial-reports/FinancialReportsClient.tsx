'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { parseAmount } from '@/lib/utils/financial';
import { useFinancialReports, FinancialTransaction } from './useFinancialReports';
import FinancialFilters from './FinancialFilters';
import FinancialCharts from './FinancialCharts';
import TransactionsTable from './TransactionsTable';
import EditTransactionModal from './EditTransactionModal';

interface FinancialReportsClientProps {
    initialData: FinancialTransaction[];
    initialView?: 'today' | 'month' | 'year' | undefined | null;
    totalRecords?: number;
    error?: string | null;
}

export default function FinancialReportsClient({ initialData, initialView, totalRecords = 0, error = null }: FinancialReportsClientProps) {
    const t = useTranslations('staff_panel.financials');

    const {
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
    } = useFinancialReports({ initialData, initialView });

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

    return (
        <div className="space-y-12 pb-32">
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <FinancialFilters
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
                showDebug={showDebug}
                setShowDebug={setShowDebug}
                filteredCount={filteredData.length}
                initialCount={transactions.length}
                totalRecords={totalRecords}
                initialData={transactions}
                filteredData={filteredData}
            />

            <FinancialCharts
                chartData={chartData}
                maxChartValue={maxChartValue}
                mounted={mounted}
                startDate={startDate}
                filteredDataLength={filteredData.length}
                onExport={exportToCSV}
            />

            <TransactionsTable
                filteredData={filteredData}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                serviceFilter={serviceFilter}
                setServiceFilter={setServiceFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                uniqueServices={uniqueServices}
                totalRevenue={totalRevenue}
                mounted={mounted}
                onEdit={(item, field) => setEditingTx({ ...item, _field: field })}
                initialDataLength={transactions.length}
                totalRecords={totalRecords}
                startDate={startDate}
                endDate={endDate}
                setForceShowAll={setForceShowAll}
            />

            <EditTransactionModal
                editingTx={editingTx}
                setEditingTx={setEditingTx}
                isSaving={isSaving}
                handleSaveEdit={handleSaveEdit}
            />
        </div>
    );
}
