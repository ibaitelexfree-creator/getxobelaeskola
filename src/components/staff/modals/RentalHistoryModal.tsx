'use client';
import React from 'react';
import AccessibleModal from '../../shared/AccessibleModal';
import { ClientDate } from '../StaffShared';
import { Rental } from '../types';

interface RentalHistoryModalProps {
    viewingHistory: Rental | null;
    setViewingHistory: (v: Rental | null) => void;
    onDeleteLog: (timestamp: string) => Promise<void>;
}

export default function RentalHistoryModal({
    viewingHistory, setViewingHistory, onDeleteLog
}: RentalHistoryModalProps) {
    return (
        <AccessibleModal
            isOpen={!!viewingHistory}
            onClose={() => setViewingHistory(null)}
            title={viewingHistory?.servicios_alquiler?.nombre_es || 'Historial de Alquiler'}
            maxWidth="max-w-2xl"
        >
            {viewingHistory && (
                <div className="space-y-4">
                    {(Array.isArray(viewingHistory.log_seguimiento) ? viewingHistory.log_seguimiento : []).slice().reverse().map((log, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-sm relative group/log">
                            <div className="flex justify-between text-3xs mb-2">
                                <span className="text-accent font-bold uppercase">{log.status}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-white/20"><ClientDate date={log.timestamp} format="short" /></span>
                                    <button
                                        onClick={() => onDeleteLog(log.timestamp)}
                                        className="opacity-0 group-hover/log:opacity-100 text-3xs hover:text-red-500 transition-all px-2"
                                        title="Borrar registro"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-white/60 italic">&quot;{log.note}&quot;</p>
                            <p className="text-[8px] text-white/20 mt-2 uppercase font-black">Registrado por: {log.staff || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            )}
        </AccessibleModal>
    );
}
