'use client';

import React from 'react';
import AccessibleModal from '../../shared/AccessibleModal';
import { FinancialTransaction } from './types';

interface FinancialEditModalProps {
    editingTx: FinancialTransaction | null;
    setEditingTx: (tx: FinancialTransaction | null) => void;
    handleSaveEdit: (field: string, newValue: any, oldValue: any) => Promise<void>;
    isSaving: boolean;
}

export default function FinancialEditModal({
    editingTx, setEditingTx, handleSaveEdit, isSaving
}: FinancialEditModalProps) {
    if (!editingTx) return null;

    return (
        <AccessibleModal
            isOpen={!!editingTx}
            onClose={() => setEditingTx(null)}
            title="Editar Transacción"
            maxWidth="max-w-md"
        >
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
        </AccessibleModal>
    );
}
