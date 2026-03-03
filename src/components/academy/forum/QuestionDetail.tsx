'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import VoteControl from './VoteControl';
import AnswerList from './AnswerList';
import AnswerForm from './AnswerForm';
import { apiUrl } from '@/lib/api';

interface QuestionDetailProps {
    question: any;
    onBack: () => void;
    onDelete?: () => void;
    isStaff: boolean; // We might need to check this
    currentUserId?: string;
}

export default function QuestionDetail({ question: initialQuestion, onBack, onDelete, isStaff, currentUserId }: QuestionDetailProps) {
    const [question, setQuestion] = useState(initialQuestion);
    const [showAnswerForm, setShowAnswerForm] = useState(false);

    const handleAnswerSuccess = (newAnswer: any) => {
        // Optimistically add answer or reload
        // Since newAnswer lacks profile, we might want to reload the whole question to get updated answers list with profiles.
        // But for UX speed, let's try to reload.

        // Actually, let's just push it with partial data and rely on reload/revalidation or fetch profile.
        // Or better, fetch the updated question data.
        fetchQuestion();
        setShowAnswerForm(false);
    };

    const fetchQuestion = async () => {
        try {
            const res = await fetch(apiUrl(`/api/forum/questions/${question.id}`));
            const data = await res.json();
            if (data.question) {
                setQuestion(data.question);
            }
        } catch (e) {
            console.error('Error refreshing question', e);
        }
    };

    const handleMarkCorrect = async (answerId: string) => {
        try {
            const res = await fetch(apiUrl(`/api/forum/answers/${answerId}/mark-correct`), {
                method: 'POST'
            });
            if (res.ok) {
                fetchQuestion();
            }
        } catch (e) {
            console.error('Error marking correct', e);
        }
    };

    return (
        <div className="animate-fade-in">
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-accent transition-colors font-bold"
            >
                ← Volver al Foro
            </button>

            <div className="glass-card p-8 border-accent/20 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl leading-none font-display italic text-accent pointer-events-none">?</div>

                <div className="flex gap-6 relative z-10">
                    <VoteControl
                        itemId={question.id}
                        itemType="pregunta"
                        initialVotes={question.votos}
                    />

                    <div className="flex-1">
                        <header className="mb-6">
                            <h2 className="text-3xl font-display italic text-white mb-3 leading-tight">{question.titulo}</h2>
                            <div className="flex items-center gap-3 text-xs text-white/50 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden">
                                        {question.profiles?.avatar_url ? (
                                            <img src={question.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white/40">
                                                {question.profiles?.nombre?.[0] || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-white/80">{question.profiles?.nombre} {question.profiles?.apellidos}</span>
                                </div>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: es })}</span>
                            </div>
                        </header>

                        <div className="text-white/80 prose prose-invert max-w-none text-lg leading-relaxed font-light">
                            <p className="whitespace-pre-wrap">{question.contenido}</p>
                        </div>

                        {(currentUserId === question.usuario_id || isStaff) && onDelete && (
                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={onDelete}
                                    className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest"
                                >
                                    Eliminar Pregunta
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-display italic text-white">
                    {question.foro_respuestas?.length || 0} Respuestas
                </h3>
                {!showAnswerForm && (
                    <button
                        onClick={() => setShowAnswerForm(true)}
                        className="px-6 py-2 bg-accent text-nautical-black font-black uppercase tracking-widest text-xs rounded hover:bg-white transition-all shadow-lg shadow-accent/20"
                    >
                        Responder
                    </button>
                )}
            </div>

            {showAnswerForm && (
                <div className="mb-10">
                    <AnswerForm
                        preguntaId={question.id}
                        onSuccess={handleAnswerSuccess}
                        onCancel={() => setShowAnswerForm(false)}
                    />
                </div>
            )}

            <AnswerList
                answers={question.foro_respuestas || []}
                isStaff={isStaff}
                onMarkCorrect={handleMarkCorrect}
            />
        </div>
    );
}
