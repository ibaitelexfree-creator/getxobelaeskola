'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ClientDate } from './StaffShared';
import { StaffProfile } from './types';
import { generateCertificatePDF } from '@/lib/certificates/pdfGenerator';

interface AcademyData {
    progress: Array<{
        estado: string;
        tipo_entidad: string;
        entidad_id: string;
        updated_at: string;
        nota_quiz?: number | null;
    }>;
    skills: Array<{
        nivel: number;
        habilidad: {
            nombre_es: string;
            icono: string;
        };
    }>;
    certificates: Array<{
        id: string;
        created_at: string;
        tipo: string;
        numero_certificado: string;
        verificacion_hash: string;
        nivel_distincion?: string;
        fecha_emision: string;
        curso?: { nombre_es: string; nombre_eu: string };
        nivel?: { nombre_es: string; nombre_eu: string };
    }>;
    achievements: unknown[];
}


interface AcademyStaffTabProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    students: StaffProfile[];
    selectedStudent: StaffProfile | null;
    selectStudent: (student: StaffProfile) => void;
    setSelectedStudent: (student: StaffProfile | null) => void;
    locale: string;
}

export default function AcademyStaffTab({
    searchTerm, setSearchTerm, students, selectedStudent, selectStudent, setSelectedStudent, locale
}: AcademyStaffTabProps) {
    const t = useTranslations('staff_panel');
    const [academyData, setAcademyData] = useState<AcademyData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedStudent) {
            fetchAcademyData(selectedStudent.id);
        } else {
            setAcademyData(null);
        }
    }, [selectedStudent]);

    const fetchAcademyData = async (studentId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/academy/student-progress?student_id=${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setAcademyData(data);
            }
        } catch (err) {
            console.error('Error fetching academy data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-premium-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8 md:pb-12">
                <div className="space-y-2">
                    <span className="text-accent uppercase tracking-[0.4em] text-2xs font-bold block">{t('academia.subtitle')}</span>
                    <h2 className="text-4xl md:text-6xl font-display text-white italic">{t('academia.title')}</h2>
                    <p className="text-technical text-white/40 tracking-[0.2em] uppercase text-2xs">{t('academia.subtitle')}</p>
                </div>
                <div className="relative group/search w-full md:w-96">
                    <input
                        type="text"
                        placeholder={t('academia.search_student')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-5 text-white font-display italic text-xl outline-none focus:border-accent"
                    />
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-20">
                {/* LISTA DE ALUMNOS */}
                <div className="space-y-8">
                    <div className="grid gap-2">
                        {students.length > 0 ? (
                            students.map((s, idx) => (
                                <button
                                    key={s.id}
                                    onClick={() => selectStudent(s)}
                                    className={`group w-full p-6 glass-card flex justify-between items-center transition-all ${selectedStudent?.id === s.id ? 'border-accent bg-accent/5' : ''}`}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    <div className="text-left">
                                        <span className={`block font-display text-xl leading-none italic ${selectedStudent?.id === s.id ? 'text-accent' : 'text-white group-hover:text-accent'} transition-colors`}>{s.nombre} {s.apellidos || ''}</span>
                                        <span className="text-technical mt-1 block group-hover:text-white transition-colors">{s.email}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xs font-black italic text-white/20 group-hover:text-accent transition-all tracking-widest uppercase">{t('courses.record')}</span>
                                    </div>
                                </button>
                            ))
                        ) : searchTerm.length > 1 ? (
                            <div className="p-10 text-center border border-dashed border-white/5 text-white/20 uppercase text-3xs font-bold">
                                {t('academia.found_no_students', { query: searchTerm })}
                            </div>
                        ) : (
                            <div className="p-10 text-center border border-dashed border-white/5 text-white/20 uppercase text-3xs font-bold">
                                {t('academia.search_student')}
                            </div>
                        )}
                    </div>
                </div>

                {/* DETALLE ACADÉMICO */}
                <div className="min-h-[600px]">
                    {selectedStudent ? (
                        <div className="glass-panel p-10 rounded-sm space-y-12 sticky top-32 animate-premium-in shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                            {/* Header Alumno */}
                            <div className="border-b border-white/5 pb-10 flex justify-between items-start">
                                <div className="space-y-4">
                                    <h3 className="text-5xl font-display text-white italic leading-none">{selectedStudent.nombre}<br />{selectedStudent.apellidos || ''}</h3>
                                    <div className="flex gap-4">
                                        <span className="text-technical text-accent bg-accent/5 px-4 py-1 border border-accent/20 rounded-full text-2xs uppercase font-bold">
                                            {t('academia.skills_count', { count: academyData?.skills?.length || 0 })}
                                        </span>
                                        <span className="text-technical text-white/40 px-4 py-1 border border-white/10 rounded-full text-2xs uppercase font-bold">
                                            {t('academia.diplomas_count', { count: academyData?.certificates?.length || 0 })}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="text-white/20 hover:text-red-500 transition-colors">✕</button>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-pulse">
                                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                    <span className="text-technical text-white/20 uppercase tracking-[0.3em] text-3xs">{t('academia.loading_record')}</span>
                                </div>
                            ) : academyData ? (
                                <div className="space-y-12">

                                    {/* Stats Rápidas */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-sm">
                                            <span className="text-2xs text-white/40 uppercase font-black block mb-2">{t('academia.unidades_leidas')}</span>
                                            <span className="text-4xl font-display text-white italic">{academyData.progress.filter(p => p.estado === 'completado').length}</span>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-sm">
                                            <span className="text-2xs text-white/40 uppercase font-black block mb-2">{t('academia.quizzes_aprobados')}</span>
                                            <span className="text-4xl font-display text-accent italic">{academyData.progress.filter(p => p.nota_quiz !== null).length}</span>
                                        </div>
                                    </div>

                                    {/* Habilidades - Estilo Premium */}
                                    <section>
                                        <h4 className="text-technical text-white/40 uppercase tracking-widest text-2xs font-black mb-6 flex items-center gap-4">
                                            {t('academia.skills')}
                                            <div className="h-px flex-1 bg-white/5" />
                                        </h4>
                                        <div className="flex flex-wrap gap-4">
                                            {academyData.skills.length > 0 ? (
                                                academyData.skills.map((s, idx) => (
                                                    <div key={idx} className="group relative">
                                                        <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-2xl hover:bg-accent/20 transition-all cursor-default" title={s.habilidad?.nombre_es}>
                                                            {s.habilidad?.icono || '🧩'}
                                                        </div>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-nautical-black border border-white/10 text-3xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm">
                                                            {s.habilidad?.nombre_es} • Lvl {s.nivel}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-3xs text-white/20 italic">{t('academia.no_records')}</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Certificados */}
                                    <section>
                                        <h4 className="text-technical text-white/40 uppercase tracking-widest text-2xs font-black mb-6 flex items-center gap-4">
                                            {t('academia.certificates')}
                                            <div className="h-px flex-1 bg-white/5" />
                                        </h4>
                                        <div className="space-y-4">
                                            {academyData.certificates.length > 0 ? (
                                                academyData.certificates.map((c) => {
                                                    const handleDownload = async (cert: any) => {
                                                        const courseName = cert.tipo === 'curso'
                                                            ? cert.curso?.nombre_es
                                                            : cert.tipo === 'nivel'
                                                                ? cert.nivel?.nombre_es
                                                                : 'Capitán de Vela';

                                                        await generateCertificatePDF({
                                                            studentName: `${selectedStudent?.nombre || ''} ${selectedStudent?.apellidos || ''}`.trim() || 'Estudiante',
                                                            courseName: courseName || 'Curso de Vela',
                                                            issueDate: cert.fecha_emision || cert.created_at,
                                                            certificateId: cert.numero_certificado,
                                                            verificationHash: cert.verificacion_hash,
                                                            distinction: (cert.nivel_distincion as any) || 'standard',
                                                        });
                                                    };

                                                    return (
                                                        <div key={c.id} className="p-6 glass-card flex justify-between items-center group/cert">
                                                            <div>
                                                                <span className="text-3xs text-accent uppercase font-black tracking-widest mb-1 block">{t('academia.official_cert')}</span>
                                                                <p className="text-lg font-display text-white italic">{c.curso?.nombre_es || c.nivel?.nombre_es || t('academia.nautical_formation')}</p>
                                                                <p className="text-technical mt-1 opacity-40 text-2xs"><ClientDate date={c.created_at} format="short" /></p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDownload(c)}
                                                                className="px-6 py-2.5 border border-white/10 text-2xs uppercase font-black tracking-widest hover:bg-white hover:text-nautical-black transition-all"
                                                            >
                                                                {t('academia.download_certificate')}
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-8 border border-dashed border-white/5 text-center text-3xs text-white/20 uppercase font-bold italic">
                                                    {t('academia.no_certificates')}
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Historial de Progreso */}
                                    <section>
                                        <h4 className="text-technical text-white/40 uppercase tracking-widest text-2xs font-black mb-6 flex items-center gap-4">
                                            {t('academia.progress_details')}
                                            <div className="h-px flex-1 bg-white/5" />
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {academyData.progress.slice().reverse().map((p, idx) => (
                                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-sm flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`w-2 h-2 rounded-full ${p.estado === 'completado' ? 'bg-accent shadow-[0_0_10px_rgba(var(--color-accent),0.5)]' : 'bg-white/20'}`} />
                                                        <span className="text-2xs text-white/60 font-mono uppercase tracking-tighter">
                                                            {p.tipo_entidad} #{p.entidad_id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-3xs text-white/40"><ClientDate date={p.updated_at} format="date" /></span>
                                                        {p.nota_quiz && <span className="ml-3 text-accent font-bold">{p.nota_quiz}%</span>}
                                                    </div>
                                                </div>
                                            ))}
                                            {academyData.progress.length === 0 && (
                                                <p className="p-10 text-center text-3xs text-white/10 uppercase font-black">{t('academia.no_records')}</p>
                                            )}
                                        </div>
                                    </section>

                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="h-full border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <span className="text-6xl text-white/5 font-display italic">📚</span>
                            <p className="text-3xs text-white/10 uppercase tracking-[0.4em] font-black max-w-[200px] leading-relaxed">
                                {t('academia.no_data')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
