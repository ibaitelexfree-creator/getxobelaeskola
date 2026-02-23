'use client';
import React from 'react';
import AccessibleModal from '../../shared/AccessibleModal';
import { ClientDate } from '../StaffShared';
import { Inscription } from '../types';

interface InscriptionHistoryModalProps {
    viewingInsHistory: Inscription | null;
    setViewingInsHistory: (v: Inscription | null) => void;
    statusNote: string;
    setStatusNote: (v: string) => void;
    onAddLog: (note: string) => Promise<void>;
    onDeleteLog: (timestamp: string) => Promise<void>;
}

export default function InscriptionHistoryModal({
    viewingInsHistory, setViewingInsHistory, statusNote, setStatusNote, onAddLog, onDeleteLog
}: InscriptionHistoryModalProps) {
    return (
        <AccessibleModal
            isOpen={!!viewingInsHistory}
            onClose={() => setViewingInsHistory(null)}
            title={viewingInsHistory?.ediciones_curso?.cursos?.nombre_es || viewingInsHistory?.cursos?.nombre_es || 'Registro Académico'}
            maxWidth="max-w-3xl"
        >
            {viewingInsHistory && (
                <div className="space-y-8">
                    {/* Quick Add Log Entry */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                        <h4 className="text-3xs uppercase tracking-[0.3em] text-accent font-bold">Añadir Entrada a Bitácora</h4>
                        <div className="flex gap-4">
                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Escribe una observación en el historial..."
                                className="flex-1 bg-white/5 border border-white/10 p-4 text-sm text-white/80 outline-none focus:border-accent resize-none rounded-sm min-h-[80px]"
                            />
                            <button
                                onClick={() => onAddLog(statusNote)}
                                className="px-8 bg-accent text-nautical-black text-3xs uppercase font-black tracking-widest hover:bg-white transition-all self-end h-[80px]"
                            >
                                Añadir
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {(Array.isArray(viewingInsHistory.log_seguimiento) ? viewingInsHistory.log_seguimiento : []).slice().reverse().map((log, idx) => (
                            <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-sm relative group/log hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <span className={`text-technical px-3 py-1 border ${log.status === 'pagado' ? 'border-accent text-accent bg-accent/5' : 'border-white/20 text-white/40'}`}>{log.status}</span>
                                    <div className="text-white/40 text-3xs">
                                        <ClientDate date={log.timestamp} format="short" />
                                        <button
                                            onClick={() => onDeleteLog(log.timestamp)}
                                            className="opacity-0 group-hover/log:opacity-100 text-3xs hover:text-red-500 transition-all ml-4"
                                        >
                                            BORRAR
                                        </button>
                                    </div>
                                </div>
                                <p className="text-lg font-display text-white/80 italic leading-relaxed">&quot;{log.note}&quot;</p>
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-3xs text-white/20 uppercase font-black tracking-widest">Oficial de Cargo: {log.staff || 'Sistemas'}</span>
                                    <span className="text-3xs text-white/10 font-mono tracking-tighter">#{idx.toString(16).padStart(4, '0')}</span>
                                </div>
                            </div>
                        ))}
                        {(!viewingInsHistory.log_seguimiento || viewingInsHistory.log_seguimiento.length === 0) && (
                            <p className="text-center text-white/20 italic py-12">No hay registros en el historial.</p>
                        )}
                    </div>
                </div>
            )}
        </AccessibleModal>
    );
}
