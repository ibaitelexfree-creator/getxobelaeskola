'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface InscriptionStatusModalProps {
    updatingInscription: { id: string, nextStatus: string } | null;
    setUpdatingInscription: (v: { id: string, nextStatus: string } | null) => void;
    statusNote: string;
    setStatusNote: (v: string) => void;
    confirmInscriptionStatusChange: () => void;
}

export default function InscriptionStatusModal({
    updatingInscription, setUpdatingInscription, statusNote, setStatusNote, confirmInscriptionStatusChange
}: InscriptionStatusModalProps) {
    const t = useTranslations('staff_panel');

    if (!updatingInscription) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-nautical-black/80 backdrop-blur-xl">
            <div className="w-full max-w-md glass-panel p-10 rounded-sm space-y-8 animate-premium-in">
                <header>
                    <span className="text-technical text-accent block mb-3">{t('courses.payment_modal.title')}</span>
                    <h3 className="text-3xl font-display text-white italic">{t('courses.payment_modal.change_to', { status: updatingInscription.nextStatus.toUpperCase() })}</h3>
                </header>
                <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder={t('courses.payment_modal.reason_placeholder')}
                    className="w-full h-32 bg-white/5 border border-white/10 p-4 text-sm text-white/80 outline-none focus:border-accent resize-none rounded-sm font-mono"
                />
                <div className="flex gap-4 pt-4">
                    <button onClick={() => setUpdatingInscription(null)} className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">{t('audit_editor.cancel')}</button>
                    <button onClick={confirmInscriptionStatusChange} className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black shadow-lg shadow-accent/20">{t('courses.update_payment')}</button>
                </div>
            </div>
        </div>
    );
}
