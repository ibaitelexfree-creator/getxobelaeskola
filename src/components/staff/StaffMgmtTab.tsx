'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ClientDate, StaffProfile } from './StaffShared';
import { apiUrl } from '@/lib/api';


interface StaffMgmtTabProps {
    isAdmin: boolean;
    locale: string;
    staffList: StaffProfile[];
    staffSearch: string;
    setStaffSearch: (v: string) => void;
    setEditStaffData: (v: StaffProfile) => void;
    setIsEditingStaff: (v: boolean) => void;
}

export default function StaffMgmtTab({
    isAdmin, locale, staffList, staffSearch, setStaffSearch,
    setEditStaffData, setIsEditingStaff
}: StaffMgmtTabProps) {
    const t = useTranslations('staff_panel');

    return (
        <div className="space-y-16 animate-premium-in">
            <header className="flex justify-between items-end border-b border-white/10 pb-12">
                <div className="space-y-2">
                    <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold block">{t('staff_mgmt.team_scan')}</span>
                    <h2 className="text-6xl font-display text-white italic">{t('staff_mgmt.title')}</h2>
                    <p className="text-technical text-white/40 tracking-[0.2em] uppercase">{t('staff_mgmt.subtitle')}</p>
                </div>
            </header>
            {isAdmin && (
                <section className="glass-panel p-10 rounded-sm">
                    <div className="mb-10">
                        <h2 className="text-4xl font-display text-white italic">{t('staff_mgmt.register_instructor')}</h2>
                        <p className="text-technical mt-2">{t('staff_mgmt.invite_staff_subtitle')}</p>
                    </div>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const formData = new FormData(form);
                            const data = {
                                email: formData.get('email'),
                                nombre: formData.get('nombre'),
                                apellidos: formData.get('apellidos'),
                                telefono: formData.get('telefono')
                            };
                            try {
                                const res = await fetch(apiUrl('/api/admin/create-staff'), {
                                    method: 'POST',
                                    body: JSON.stringify(data)
                                });
                                if (res.ok) {
                                    alert(t('staff_mgmt.invite_success'));
                                    form.reset();
                                    window.location.reload();
                                } else {
                                    const errData = await res.json();
                                    alert(t('staff_mgmt.error') + errData.error);
                                }
                            } catch (err: unknown) {
                                const error = err as Error;
                                alert(t('staff_mgmt.connection_error') + ': ' + error.message);
                            }
                        }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        <input name="nombre" placeholder={t('staff_mgmt.name_placeholder')} required className="bg-white/5 border border-white/5 p-5 text-lg font-display italic text-white outline-none focus:border-accent rounded-sm" />
                        <input name="apellidos" placeholder={t('staff_mgmt.last_name_placeholder')} required className="bg-white/5 border border-white/5 p-5 text-lg font-display italic text-white outline-none focus:border-accent rounded-sm" />
                        <input name="telefono" placeholder={t('staff_mgmt.phone_placeholder')} className="bg-white/5 border border-white/5 p-5 text-lg font-display italic text-white outline-none focus:border-accent rounded-sm" onFocus={(e) => e.target.select()} />
                        <input name="email" type="email" placeholder={t('staff_mgmt.email_placeholder')} required className="bg-white/5 border border-white/5 p-5 text-sm font-mono text-white outline-none focus:border-accent rounded-sm md:col-span-3" />
                        <button type="submit" className="md:col-span-3 py-5 bg-accent text-nautical-black text-technical font-black tracking-widest hover:bg-white transition-all shadow-xl shadow-accent/20">{t('staff_mgmt.send_invitation')}</button>
                    </form>
                </section>
            )}

            <section className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 gap-6">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-display text-white italic">{t('staff_mgmt.active_staff')}</h3>
                        <span className="text-technical">{staffList.length} {t('staff_mgmt.instructors_count')} {staffSearch && `(${t('staff_mgmt.filtered')})`}</span>
                    </div>
                    <div className="w-full md:w-80 relative">
                        <input
                            type="text"
                            placeholder={t('staff_mgmt.search_instructor_placeholder')}
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm font-display italic outline-none focus:border-accent rounded-sm"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xs text-white/20 uppercase font-black">{t('staff_mgmt.team_label')}</div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(staffList || []).length > 0 ? (staffList || []).map((p, pIdx) => (
                        <div key={p?.id || `staff-${pIdx}`} className="p-8 glass-card rounded-sm group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 text-technical opacity-20">{p?.rol || 'staff'}</div>
                            <p className="font-display text-3xl text-white italic group-hover:text-accent transition-colors">{(p?.nombre || 'Instructor')} {(p?.apellidos || '')}</p>
                            <div className="mt-3 space-y-1">
                                <p className="text-technical text-accent/70 text-2xs truncate">{p?.email || 'Sin email'}</p>
                                <p className="text-technical text-white/40 text-3xs">{p?.telefono ? `📞 ${p.telefono}` : 'Sin teléfono'}</p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                                <div className="flex justify-between items-center text-white/20">
                                    <span className="text-technical opacity-50"><ClientDate date={p?.created_at} /></span>
                                    <Link href={`/${locale}/staff/activity/${p.id}`} className="text-3xs uppercase tracking-widest text-accent hover:text-white font-bold transition-colors">
                                        {t('staff_mgmt.view_activity')}
                                    </Link>
                                </div>
                                {isAdmin && (
                                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                        <button
                                            onClick={() => {
                                                setEditStaffData({ ...p });
                                                setIsEditingStaff(true);
                                            }}
                                            className="text-technical hover:text-brass-gold transition-colors text-3xs uppercase tracking-widest font-bold"
                                        >
                                            {t('staff_mgmt.edit_data')}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(t('staff_mgmt.confirm_remove', { name: p.nombre }))) {
                                                    await fetch(apiUrl('/api/admin/remove-staff'), { method: 'POST', body: JSON.stringify({ userId: p.id }) });
                                                    window.location.reload();
                                                }
                                            }}
                                            className="text-technical hover:text-red-500 transition-colors opacity-40 hover:opacity-100 text-3xs uppercase tracking-widest"
                                        >
                                            {t('staff_mgmt.remove_staff')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full border border-dashed border-white/5 p-20 text-center">
                            <p className="text-3xs text-white/20 uppercase font-black tracking-widest italic">{t('staff_mgmt.loading')}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
