'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { StaffProfile } from '../types';

interface StaffEditModalProps {
    isEditingStaff: boolean;
    setIsEditingStaff: (v: boolean) => void;
    editStaffData: StaffProfile | null;
    setEditStaffData: (v: StaffProfile | null) => void;
    handleUpdateStaff: () => void;
    isSavingStaff: boolean;
}

export default function StaffEditModal({
    isEditingStaff, setIsEditingStaff, editStaffData, setEditStaffData, handleUpdateStaff, isSavingStaff
}: StaffEditModalProps) {
    const t = useTranslations('staff_panel');

    if (!isEditingStaff || !editStaffData) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-nautical-black/90 backdrop-blur-2xl">
            <div className="w-full max-w-lg glass-panel p-12 rounded-sm space-y-10 animate-premium-in border border-white/10 shadow-2xl">
                <header>
                    <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold mb-4 block">{t('staff_mgmt.edit_modal.title')}</span>
                    <h3 className="text-4xl font-display text-white italic">{t('staff_mgmt.edit_modal.edit_profile')}</h3>
                    <p className="text-technical text-white/40 mt-2">{t('staff_mgmt.edit_modal.id')}: {editStaffData.id}</p>
                </header>

                <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.name')}</label>
                            <input
                                value={editStaffData.nombre || ''}
                                onChange={(e) => setEditStaffData({ ...editStaffData, nombre: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-5 text-lg font-display italic text-white outline-none focus:border-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.last_name')}</label>
                            <input
                                value={editStaffData.apellidos || ''}
                                onChange={(e) => setEditStaffData({ ...editStaffData, apellidos: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-5 text-lg font-display italic text-white outline-none focus:border-accent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.email')}</label>
                        <input
                            value={editStaffData.email || ''}
                            onChange={(e) => setEditStaffData({ ...editStaffData, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-5 text-sm font-mono text-white outline-none focus:border-accent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.phone')}</label>
                        <input
                            value={editStaffData.telefono || ''}
                            onChange={(e) => setEditStaffData({ ...editStaffData, telefono: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-5 text-lg font-display italic text-white outline-none focus:border-accent"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        onClick={() => setIsEditingStaff(false)}
                        className="flex-1 py-5 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-all font-bold"
                    >
                        {t('staff_mgmt.edit_modal.discard')}
                    </button>
                    <button
                        onClick={handleUpdateStaff}
                        disabled={isSavingStaff}
                        className="flex-1 py-5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                    >
                        {isSavingStaff ? t('staff_mgmt.edit_modal.saving') : t('staff_mgmt.edit_modal.apply_changes')}
                    </button>
                </div>
            </div>
        </div>
    );
}
