'use client';

import React, { useState, useEffect } from 'react';
import { X, Book, FileText, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { useAcademyFeedback } from '@/hooks/useAcademyFeedback';
import FeedbackRecorder from '@/components/shared/feedback/FeedbackRecorder';
import FeedbackDisplay from '@/components/shared/feedback/FeedbackDisplay';

interface StudentDetailModalProps {
    student: {
        id: string;
        nombre: string;
        apellidos: string;
        email: string;
    };
    onClose: () => void;
}

export default function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
    const { showMessage } = useAcademyFeedback();
    const [activeTab, setActiveTab] = useState<'logbook' | 'evaluations'>('logbook');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ diary: any[], evaluations: any[], feedback: any[] }>({ diary: [], evaluations: [], feedback: [] });
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/academy/student-logbook?student_id=${student.id}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                showMessage('Error', 'Error al cargar datos del alumno', 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage('Error', 'Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [student.id]);

    const getFeedbackForContext = (contextId: string) => {
        return data.feedback.filter((f: any) => f.context_id === contextId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nautical-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0a1628] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white italic">
                            {student.nombre} {student.apellidos}
                        </h2>
                        <p className="text-xs uppercase tracking-widest text-white/40 mt-1">{student.email}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5">
                    {[
                        { id: 'logbook', label: 'Bitácora Personal', icon: <Book size={14} /> },
                        { id: 'evaluations', label: 'Evaluaciones', icon: <FileText size={14} /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors
                                ${activeTab === tab.id
                                    ? 'bg-accent/5 text-accent border-b-2 border-accent'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-accent" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTab === 'logbook' && (
                                <>
                                    {data.diary.length === 0 ? (
                                        <p className="text-center text-white/40 italic py-12">No hay entradas en la bitácora.</p>
                                    ) : (
                                        data.diary.map((entry: any) => {
                                            const feedback = getFeedbackForContext(entry.id);
                                            const isExpanded = expandedItem === entry.id;

                                            return (
                                                <div key={entry.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 transition-all hover:border-white/10">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-xs font-bold text-accent">
                                                                    {new Date(entry.fecha).toLocaleDateString()}
                                                                </span>
                                                                {entry.tags && entry.tags.map((tag: string) => (
                                                                    <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase tracking-wider text-white/40 font-bold">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-white/80 leading-relaxed font-serif italic">
                                                                "{entry.contenido}"
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => setExpandedItem(isExpanded ? null : entry.id)}
                                                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${feedback.length > 0 ? 'bg-accent text-nautical-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Feedback Section */}
                                                    {isExpanded && (
                                                        <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2">
                                                            <FeedbackDisplay feedback={feedback} />

                                                            <div className="mt-6">
                                                                <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-3">Añadir Feedback</h4>
                                                                <FeedbackRecorder
                                                                    studentId={student.id}
                                                                    contextType="logbook"
                                                                    contextId={entry.id}
                                                                    onSuccess={() => {
                                                                        loadData(); // Refresh to show new feedback
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </>
                            )}

                            {activeTab === 'evaluations' && (
                                <>
                                    {data.evaluations.length === 0 ? (
                                        <p className="text-center text-white/40 italic py-12">No hay evaluaciones realizadas.</p>
                                    ) : (
                                        data.evaluations.map((attempt: any) => {
                                            const feedback = getFeedbackForContext(attempt.id);
                                            const isExpanded = expandedItem === attempt.id;
                                            const passed = attempt.nota >= (attempt.evaluacion?.nota_aprobado || 5);

                                            return (
                                                <div key={attempt.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 transition-all hover:border-white/10">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-white font-bold mb-1">
                                                                {attempt.evaluacion?.titulo_es || 'Evaluación'}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-xs text-white/40">
                                                                <span>{new Date(attempt.created_at).toLocaleDateString()}</span>
                                                                <span className={`font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                                                                    Nota: {attempt.nota.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setExpandedItem(isExpanded ? null : attempt.id)}
                                                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${feedback.length > 0 ? 'bg-accent text-nautical-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>

                                                     {/* Feedback Section */}
                                                     {isExpanded && (
                                                        <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2">
                                                            <FeedbackDisplay feedback={feedback} />

                                                            <div className="mt-6">
                                                                <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-3">Añadir Feedback</h4>
                                                                <FeedbackRecorder
                                                                    studentId={student.id}
                                                                    contextType="evaluation"
                                                                    contextId={attempt.id}
                                                                    onSuccess={() => {
                                                                        loadData();
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
