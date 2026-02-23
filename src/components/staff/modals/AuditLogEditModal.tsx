'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { AuditLog } from '../types';

interface AuditLogEditModalProps {
    editingLog: AuditLog | null;
    setEditingLog: (v: AuditLog | null) => void;
    handleUpdateLog: () => void;
    isSavingLog: boolean;
}

export default function AuditLogEditModal({
    editingLog, setEditingLog, handleUpdateLog, isSavingLog
}: AuditLogEditModalProps) {
    const t = useTranslations('staff_panel');

    if (!editingLog) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-nautical-black/95 backdrop-blur-2xl">
            <div className="w-full max-w-2xl glass-panel p-12 rounded-sm space-y-10 animate-premium-in border border-white/10 shadow-3xl">
                <header className="flex justify-between items-start">
                    <div className="space-y-2">
                        <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold block mb-4">{t('audit_editor.title')}</span>
                        <h3 className="text-4xl font-display text-white italic">{t('audit_editor.header')}</h3>
                    </div>
                    <button onClick={() => setEditingLog(null)} className="text-white/20 hover:text-white transition-colors text-2xl">×</button>
                </header>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.description')}</label>
                        <input
                            value={editingLog.description || ''}
                            onChange={(e) => setEditingLog({ ...editingLog, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-5 text-white font-display italic text-xl outline-none focus:border-accent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.target_id')}</label>
                            <input
                                value={editingLog.target_id || ''}
                                onChange={(e) => setEditingLog({ ...editingLog, target_id: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.target_type')}</label>
                            <input
                                value={editingLog.target_type || ''}
                                onChange={(e) => setEditingLog({ ...editingLog, target_type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.metadata_json')}</label>
                        <textarea
                            rows={8}
                            value={JSON.stringify(editingLog.metadata, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    setEditingLog({ ...editingLog, metadata: parsed });
                                } catch { }
                            }}
                            className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent resize-none custom-scrollbar"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        onClick={() => setEditingLog(null)}
                        className="flex-1 py-5 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-all font-bold"
                    >
                        {t('audit_editor.cancel')}
                    </button>
                    <button
                        onClick={handleUpdateLog}
                        disabled={isSavingLog}
                        className="flex-1 py-5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-xl shadow-accent/20"
                    >
                        {isSavingLog ? t('audit_editor.saving') : t('audit_editor.update')}
                    </button>
                </div>
            </div>
        </div>
    );
}
