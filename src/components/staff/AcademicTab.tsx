'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { ClientDate, StaffProfile } from './StaffShared';

interface Inscription {
    id: string;
    perfil_id: string;
    curso_id?: string;
    edicion_id?: string;
    estado_pago: string;
    created_at: string;
    log_seguimiento?: {
        timestamp: string;
        status: string;
        note: string;
        staff: string;
    }[];
    cursos?: {
        nombre_es: string;
        nombre_eu: string;
    } | null;
    ediciones_curso?: {
        id: string;
        fecha_inicio: string;
        cursos?: {
            nombre_es: string;
            nombre_eu: string;
        } | null;
    } | null;
}

interface AcademicTabProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    students: StaffProfile[];
    selectedStudent: StaffProfile | null;
    isEditingStudent: boolean;
    editStudentData: StaffProfile | null;
    isSavingProfile: boolean;
    studentInscriptions: Inscription[];
    selectStudent: (student: StaffProfile) => void;
    setIsEditingStudent: (v: boolean) => void;
    setEditStudentData: (v: StaffProfile) => void;
    setSelectedStudent: (v: StaffProfile | null) => void;
    handleSaveProfile: () => void;
    setViewingInsHistory: (v: Inscription) => void;
    updateInscriptionStatus: (insId: string, nextStatus: string) => void;
    setStudentInscriptions: React.Dispatch<React.SetStateAction<Inscription[]>>;
}

export default function AcademicTab({
    searchTerm, setSearchTerm, students, selectedStudent, isEditingStudent, editStudentData,
    isSavingProfile, studentInscriptions, selectStudent, setIsEditingStudent, setEditStudentData,
    setSelectedStudent, handleSaveProfile, setViewingInsHistory, updateInscriptionStatus, setStudentInscriptions
}: AcademicTabProps) {
    const t = useTranslations('staff_panel');

    return (
        <div className="space-y-12 animate-premium-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8 md:pb-12">
                <div className="space-y-2">
                    <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold block">{t('courses.base_scan')}</span>
                    <h2 className="text-4xl md:text-6xl font-display text-white italic">{t('courses.title')}</h2>
                    <p className="text-technical text-white/40 tracking-[0.2em] uppercase">{t('courses.subtitle')}</p>
                </div>
            </header>
            <div className="grid lg:grid-cols-2 gap-20">
                <div className="space-y-8">
                    <div className="animate-premium-in">
                        <h2 className="text-5xl font-display text-white italic">Académico</h2>
                        <p className="text-technical mt-3">Gestión de expedientes y alumnos</p>
                    </div>
                    <div className="relative group/search">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o apellido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 p-8 text-white text-xl font-display italic outline-none focus:border-accent transition-all rounded-sm backdrop-blur-sm shadow-xl"
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-technical group-hover/search:text-accent transition-colors">Escaneo de Base 🔍</div>
                    </div>

                    <div className="grid gap-2">
                        {students.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => selectStudent(s)}
                                className="group w-full p-6 glass-card flex justify-between items-center animate-premium-in"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <div className="text-left">
                                    <span className="block font-display text-xl leading-none text-white group-hover:text-accent transition-colors italic">{s.nombre} {s.apellidos || ''}</span>
                                    <span className="text-technical mt-1 block group-hover:text-white transition-colors">{s.rol || 'alumno'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-3xs font-black italic text-white/20 group-hover:text-accent transition-all tracking-widest">EXPEDIENTE</span>
                                    <div className="h-px w-0 group-hover:w-full bg-accent transition-all duration-500 mt-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-[500px]">
                    {selectedStudent ? (
                        <div className="glass-panel p-10 rounded-sm space-y-12 sticky top-32 animate-premium-in shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                            <div className="border-b border-white/5 pb-10">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-technical text-accent bg-accent/5 px-4 py-1.5 border border-accent/20 rounded-full">{t('courses.edit_profile.title')}</span>
                                    <div className="flex items-center gap-6">
                                        {!isEditingStudent ? (
                                            <button onClick={() => setIsEditingStudent(true)} className="text-technical text-white/40 hover:text-accent transition-colors flex items-center gap-2 group/edit">
                                                <span>{t('courses.edit_profile.edit_btn')}</span>
                                                <span className="group-hover:rotate-12 transition-transform">✎</span>
                                            </button>
                                        ) : (
                                            <button onClick={() => setIsEditingStudent(false)} className="text-technical text-white/20 hover:text-white transition-colors">
                                                {t('courses.edit_profile.cancel_btn')}
                                            </button>
                                        )}
                                        <button onClick={() => setSelectedStudent(null)} className="text-technical text-white/20 hover:text-red-500 transition-colors">{t('courses.edit_profile.close_btn')} ✕</button>
                                    </div>
                                </div>

                                {!isEditingStudent ? (
                                    <div className="space-y-4">
                                        <h3 className="text-6xl font-display text-white italic leading-none tracking-tight">{selectedStudent?.nombre || 'Alumno'}<br />{selectedStudent?.apellidos || ''}</h3>
                                        <p className="text-technical text-accent/60 flex items-center gap-4">
                                            <span>{t(`courses.edit_profile.role.${selectedStudent?.rol || 'student'}`)}</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="font-mono">{selectedStudent?.telefono || 'Sin teléfono'}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                value={editStudentData?.nombre || ''}
                                                onChange={e => editStudentData && setEditStudentData({ ...editStudentData, nombre: e.target.value })}
                                                placeholder={t('courses.edit_profile.name')}
                                                className="bg-white/5 border border-white/10 p-4 text-white text-xl font-display italic outline-none focus:border-accent"
                                            />
                                            <input
                                                value={editStudentData?.apellidos || ''}
                                                onChange={e => editStudentData && setEditStudentData({ ...editStudentData, apellidos: e.target.value })}
                                                placeholder={t('courses.edit_profile.last_name')}
                                                className="bg-white/5 border border-white/10 p-4 text-white text-xl font-display italic outline-none focus:border-accent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                value={editStudentData?.rol || 'alumno'}
                                                onChange={e => editStudentData && setEditStudentData({ ...editStudentData, rol: e.target.value })}
                                                className="bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-accent appearance-none uppercase font-black tracking-widest"
                                            >
                                                <option value="alumno">{t('courses.edit_profile.role.student')}</option>
                                                <option value="socio">{t('courses.edit_profile.role.partner')}</option>
                                                <option value="instructor">{t('courses.edit_profile.role.instructor')}</option>
                                                <option value="admin">{t('courses.edit_profile.role.admin')}</option>
                                            </select>
                                            <input
                                                value={editStudentData?.telefono || ''}
                                                onChange={e => editStudentData && setEditStudentData({ ...editStudentData, telefono: e.target.value })}
                                                placeholder={t('courses.edit_profile.phone')}
                                                className="bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-accent font-mono"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                            className="w-full py-4 bg-accent text-nautical-black text-3xs uppercase font-black tracking-widest hover:bg-white transition-all mt-4"
                                        >
                                            {isSavingProfile ? t('courses.edit_profile.saving') : t('courses.edit_profile.save_btn')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h4 className="text-technical mb-6 opacity-30">{t('courses.inscriptions_title')}</h4>
                            {(studentInscriptions || []).length > 0 ? (
                                <div className="space-y-4">
                                    {(studentInscriptions || []).map((ins, idx) => (
                                        <div key={`ins-${idx}`} className="p-8 glass-card flex justify-between items-center group/ins">
                                            <div className="space-y-2">
                                                <p className="text-lg font-display text-white italic group-hover:text-accent transition-colors">{ins?.ediciones_curso?.cursos?.nombre_es || ins?.cursos?.nombre_es || t('courses.equipment_rental')}</p>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-technical"><ClientDate date={ins?.ediciones_curso?.fecha_inicio || ins?.created_at} /></p>
                                                    {isEditingStudent && (
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm(t('courses.delete_confirm'))) {
                                                                    try {
                                                                        const res = await fetch('/api/admin/delete-inscription', {
                                                                            method: 'POST',
                                                                            body: JSON.stringify({ id: ins.id })
                                                                        });
                                                                        if (res.ok) setStudentInscriptions(prev => prev.filter(i => i.id !== ins.id));
                                                                    } catch { alert(t('courses.delete_error')); }
                                                                }
                                                            }}
                                                            className="text-technical text-red-500/40 hover:text-red-500 transition-colors"
                                                        >
                                                            {t('courses.delete_btn')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => setViewingInsHistory(ins)}
                                                    className="text-technical hover:text-accent transition-all opacity-20 group-hover/ins:opacity-100"
                                                    title={t('courses.view_logbook')}
                                                >
                                                    Logbook 📜
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const next = ins.estado_pago === 'pagado' ? 'pendiente' : 'pagado';
                                                        updateInscriptionStatus(ins.id, next);
                                                    }}
                                                    className={`min-w-[120px] py-2.5 rounded-full text-technical font-black tracking-[0.2em] transition-all border ${ins?.estado_pago === 'pagado' ? 'bg-accent text-nautical-black border-accent' : 'border-white/10 text-white/40 hover:border-white hover:text-white'}`}
                                                >
                                                    {ins?.estado_pago || 'Pendiente'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 border border-dashed border-white/5 text-center text-3xs text-white/20 uppercase font-bold italic">
                                    {t('courses.no_history')}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <span className="text-6xl text-white/5 font-display italic">?</span>
                            <p className="text-3xs text-white/10 uppercase tracking-[0.4em] font-black max-w-[200px] leading-relaxed">
                                {t('courses.search_placeholder')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
