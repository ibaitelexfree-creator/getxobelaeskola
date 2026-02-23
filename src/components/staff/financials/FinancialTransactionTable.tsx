'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FinancialTransaction } from './types';
import { ClientDate } from './ClientDate';

interface FinancialTransactionTableProps {
    filteredData: FinancialTransaction[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    statusFilter: string;
    setStatusFilter: (v: string) => void;
    serviceFilter: string;
    setServiceFilter: (v: string) => void;
    uniqueServices: string[];
    sortBy: string;
    setSortBy: (v: string) => void;
    mounted: boolean;
    totalRevenue: number;
    initialDataLength: number;
    totalRecords: number;
    startDate: string;
    endDate: string;
    setForceShowAll: React.Dispatch<React.SetStateAction<boolean>>;
    setEditingTx: (tx: FinancialTransaction) => void;
}

export default function FinancialTransactionTable({
    filteredData,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    serviceFilter, setServiceFilter,
    uniqueServices,
    sortBy, setSortBy,
    mounted,
    totalRevenue,
    initialDataLength,
    totalRecords,
    startDate,
    endDate,
    setForceShowAll,
    setEditingTx
}: FinancialTransactionTableProps) {
    const t = useTranslations('staff_panel.financials');

    const hasHistory = (item: FinancialTransaction, field: string) => {
        return item.history?.some((h: any) => h.field_name === field);
    };

    const getHistoryForField = (item: FinancialTransaction, field: string) => {
        return item.history?.filter((h: any) => h.field_name === field) || [];
    };

    return (
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
                                            <div className={`${initialDataLength > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                                                Loaded in Browser: {initialDataLength} records.
                                            </div>
                                            {initialDataLength > 0 && filteredData.length === 0 && (
                                                <div className="text-orange-400">
                                                    Warning: {initialDataLength} records are hidden by the current date filter ({startDate} to {endDate}).
                                                    <br />
                                                    <button onClick={() => setForceShowAll(true)} className="mt-2 text-accent underline">
                                                        Click here to FORCE SHOW ALL DATA
                                                    </button>
                                                </div>
                                            )}
                                            {totalRecords > 0 && initialDataLength === 0 && (
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
    );
}
