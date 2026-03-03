'use client';

import React, { useState, useEffect } from 'react';
import QuestionList from './QuestionList';
import QuestionDetail from './QuestionDetail';
import AskQuestionForm from './AskQuestionForm';
import { apiUrl } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

interface ForumMainProps {
    moduloId: string;
}

export default function ForumMain({ moduloId }: ForumMainProps) {
    const [view, setView] = useState<'list' | 'detail' | 'ask'>('list');
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isStaff, setIsStaff] = useState(false);

    useEffect(() => {
        fetchQuestions();
        checkUser();
    }, [moduloId]);

    const checkUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUser(user);
            // Check staff status
            const { data: profile } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', user.id)
                .single();

            if (profile) {
                setIsStaff(profile.rol === 'admin' || profile.rol === 'instructor');
            }
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(apiUrl(`/api/forum/questions?modulo_id=${moduloId}`));
            const data = await res.json();
            if (data.questions) {
                setQuestions(data.questions);
            }
        } catch (e) {
            console.error('Error fetching questions', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectQuestion = async (question: any) => {
        // Fetch full details
        try {
            const res = await fetch(apiUrl(`/api/forum/questions/${question.id}`));
            const data = await res.json();
            if (data.question) {
                setSelectedQuestion(data.question);
                setView('detail');
            }
        } catch (e) {
            console.error('Error fetching question details', e);
        }
    };

    const handleAskSuccess = (newQuestion: any) => {
        fetchQuestions();
        setView('list');
    };

    const handleDeleteQuestion = async () => {
        if (!selectedQuestion) return;
        if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) return;

        try {
            const res = await fetch(apiUrl(`/api/forum/questions/${selectedQuestion.id}`), {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchQuestions();
                setView('list');
                setSelectedQuestion(null);
            }
        } catch (e) {
            console.error('Error deleting question', e);
        }
    };

    return (
        <section className="container mx-auto px-6 py-20 border-t border-white/10">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-black block mb-4">Comunidad</span>
                        <h2 className="text-4xl font-display italic text-white">Foro del Módulo</h2>
                    </div>
                    {view === 'list' && (
                        <button
                            onClick={() => setView('ask')}
                            className="px-8 py-3 bg-white text-nautical-black font-black uppercase tracking-widest text-xs hover:bg-accent transition-all shadow-xl"
                        >
                            Hacer Pregunta
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="text-center py-20 text-white/20 animate-pulse">Cargando foro...</div>
                ) : (
                    <>
                        {view === 'list' && (
                            <QuestionList
                                questions={questions}
                                onSelectQuestion={handleSelectQuestion}
                            />
                        )}

                        {view === 'detail' && selectedQuestion && (
                            <QuestionDetail
                                question={selectedQuestion}
                                onBack={() => setView('list')}
                                onDelete={handleDeleteQuestion}
                                isStaff={isStaff}
                                currentUserId={currentUser?.id}
                            />
                        )}

                        {view === 'ask' && (
                            <div className="max-w-2xl mx-auto">
                                <AskQuestionForm
                                    moduloId={moduloId}
                                    onSuccess={handleAskSuccess}
                                    onCancel={() => setView('list')}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
