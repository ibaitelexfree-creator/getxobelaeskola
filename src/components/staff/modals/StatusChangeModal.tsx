'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface StatusChangeModalProps {
    updatingStatus: { id: string, nextStatus: string } | null;
    setUpdatingStatus: (v: { id: string, nextStatus: string } | null) => void;
    statusNote: string;
    setStatusNote: (v: string) => void;
    confirmStatusChange: () => void;
}

export default function StatusChangeModal({
    updatingStatus, setUpdatingStatus, statusNote, setStatusNote, confirmStatusChange
}: StatusChangeModalProps) {
    const t = useTranslations('staff_panel');

    if (!updatingStatus) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-nautical-black/80 backdrop-blur-xl">
            <div className="w-full max-w-md glass-panel p-10 rounded-sm space-y-8 animate-premium-in">
                <header>
                    <span className="text-technical text-accent block mb-3">{t('rentals.status_modal.title')}</span>
                    <h3 className="text-3xl font-display text-white italic">{t('rentals.status_modal.change_to', { status: updatingStatus.nextStatus.toUpperCase() })}</h3>
                </header>

                <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder={t('rentals.status_modal.note_placeholder')}
                    className="w-full h-32 bg-white/5 border border-white/10 p-4 text-sm text-white/80 outline-none focus:border-accent resize-none rounded-sm"
                />

                <div className="flex gap-4">
                    <button onClick={() => setUpdatingStatus(null)} className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-widest text-white/40">{t('audit_editor.cancel')}</button>
                    <button onClick={confirmStatusChange} className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-bold">{t('rentals.status_modal.confirm')}</button>
                </div>
            </div>
        </div>
    );
}
