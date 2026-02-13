import React, { useState } from 'react';
import Image from 'next/image';
import { Question } from './types';

interface QuizViewProps {
    question: Question;
    allQuestionIds: string[];
    currentQuestionIndex: number;
    totalQuestions: number;
    onAnswer: (answer: string) => void;
    isSubmitting: boolean;
    timeLeft?: number;
    durationSecs?: number;
    answers: Record<string, any>;
    onNavigate: (index: number) => void;
    onSubmit: () => void;
    lastSaved?: string | null;
}

export default function QuizView({
    question,
    allQuestionIds,
    currentQuestionIndex,
    totalQuestions,
    onAnswer,
    isSubmitting,
    timeLeft,
    durationSecs,
    answers,
    onNavigate,
    onSubmit,
    lastSaved
}: QuizViewProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    // Keyboard Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSubmitting || showConfirm) {
                if (showConfirm && e.key === 'Enter') handleFinalSubmit();
                if (showConfirm && e.key === 'Escape') setShowConfirm(false);
                return;
            }

            // Options 1-4
            if (['1', '2', '3', '4'].includes(e.key)) {
                const idx = parseInt(e.key) - 1;
                const options = question.tipo_pregunta === 'verdadero_falso'
                    ? [{ id: 'Verdadero' }, { id: 'Falso' }]
                    : question.opciones_json || [];
                if (options[idx]) {
                    onAnswer(options[idx].id);
                }
            }

            // Navigation
            if (e.key === 'ArrowRight' || e.key === 'n') {
                if (currentQuestionIndex < totalQuestions - 1) onNavigate(currentQuestionIndex + 1);
                else if (isLastQuestion) setShowConfirm(true);
            }
            if (e.key === 'ArrowLeft' || e.key === 'p') {
                if (currentQuestionIndex > 0) onNavigate(currentQuestionIndex - 1);
            }

            // Submit
            if (e.key === 'Enter' && isLastQuestion && answers[question.id]) {
                setShowConfirm(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [question, currentQuestionIndex, answers, isSubmitting, showConfirm, onAnswer, onNavigate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const isUrgent = timeLeft !== undefined && timeLeft < 60;
    const isCritical = timeLeft !== undefined && timeLeft < 10;

    const renderOptions = () => {
        if (question.tipo_pregunta === 'verdadero_falso') {
            const options = [
                { id: 'Verdadero', texto: 'Verdadero' },
                { id: 'Falso', texto: 'Falso' }
            ];
            return (
                <div className="grid grid-cols-2 gap-4 pt-4">
                    {options.map((opt) => {
                        const isSelected = answers[question.id] === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onAnswer(opt.id)}
                                disabled={isSubmitting}
                                className={`group relative flex flex-col items-center justify-center p-8 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${isSelected
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                    }`}
                            >
                                <span className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                    {opt.texto}
                                </span>
                                {isSelected && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                            </button>
                        );
                    })}
                </div>
            );
        }

        // Default: Opcion Multiple
        return (
            <div className="grid gap-4 pt-4">
                {question.opciones_json?.map((option, idx) => {
                    const isSelected = answers[question.id] === option.id;
                    return (
                        <button
                            key={option.id || idx}
                            onClick={() => onAnswer(option.id)}
                            disabled={isSubmitting}
                            className={`group relative flex items-center w-full p-5 text-left border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${isSelected
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                }`}
                        >
                            <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-base font-bold mr-5 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                                }`}>
                                {option.id || String.fromCharCode(65 + idx)}
                            </span>
                            <span className={`text-base font-medium transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground'
                                }`}>
                                {option.texto}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const handleFinalSubmit = () => {
        setShowConfirm(false);
        onSubmit();
    };

    if (showConfirm) {
        return (
            <div className="w-full max-w-2xl mx-auto p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto text-3xl">
                    ⚓
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">¿Rumbo a puerto?</h2>
                    <p className="text-slate-400">Has respondido {Object.keys(answers).length} de {totalQuestions} preguntas. Una vez enviado no podrás cambiar tus respuestas.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 py-4 px-6 rounded-xl font-bold text-2xs uppercase tracking-widest bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all"
                    >
                        Revisar Respuestas
                    </button>
                    <button
                        onClick={handleFinalSubmit}
                        className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-2xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        Confirmar y Enviar 🏁
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
            {/* Top Bar: Progress & Timer */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                {/* Progress */}
                <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center justify-between text-2xs uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
                        <div className="flex items-center gap-3">
                            <span>Progreso <span className="text-muted-foreground/30">|</span> {currentQuestionIndex + 1} de {totalQuestions}</span>
                            {lastSaved && (
                                <span className="text-3xs text-green-500/60 font-mono animate-pulse">✓ Guardado</span>
                            )}
                        </div>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Timer */}
                {timeLeft !== undefined && (
                    <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isUrgent
                        ? 'bg-red-500/10 border-red-500/50 animate-pulse'
                        : 'bg-white/5 border-white/10'
                        }`}>
                        <div className="relative w-8 h-8">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="16" fill="none"
                                    className={isUrgent ? 'stroke-red-500' : 'stroke-blue-500'}
                                    strokeWidth="3"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - (timeLeft / (durationSecs || 1)) * 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-3xs font-mono">
                                {isCritical ? '🛑' : '⏱️'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xs uppercase tracking-widest text-muted-foreground font-bold">Tiempo</span>
                            <span className={`text-xl font-mono font-bold tabular-nums ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar (Desktop) */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                        <h4 className="text-3xs uppercase tracking-widest font-black text-muted-foreground mb-6">Mapa de Examen</h4>
                        <div className="grid grid-cols-4 gap-3">
                            {allQuestionIds.map((qId, idx) => {
                                const isCurrent = idx === currentQuestionIndex;
                                const hasAnswer = !!answers[qId];

                                return (
                                    <button
                                        key={qId}
                                        onClick={() => onNavigate(idx)}
                                        className={`w-10 h-10 rounded-lg text-2xs font-bold transition-all flex items-center justify-center border ${isCurrent
                                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                            : hasAnswer ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                            <div className="flex items-center gap-3 text-3xs text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-blue-600" /> Actual
                            </div>
                            <div className="flex items-center gap-3 text-3xs text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-green-500/50" /> Respondida
                            </div>
                            <div className="flex items-center gap-3 text-3xs text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-white/10" /> Pendiente
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full py-4 px-6 bg-white text-black rounded-2xl font-black text-2xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Finalizar</span>
                        <span>🏁</span>
                    </button>
                </div>

                {/* Main Question Area */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-card/40 backdrop-blur-md p-10 rounded-2xl border border-white/10 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-3xs font-bold uppercase tracking-wider rounded-full border border-primary/20">
                                    {question.tipo_pregunta.replace('_', ' ')}
                                </div>
                                <span className="text-3xs font-bold text-muted-foreground/40">{question.puntos} {question.puntos === 1 ? 'punto' : 'puntos'}</span>
                            </div>
                            <h3 className="text-2xl font-semibold text-foreground leading-tight tracking-tight">
                                {question.enunciado_es}
                            </h3>
                        </div>

                        {question.imagen_url && (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden ring-1 ring-white/10 bg-black/20 shadow-inner">
                                <Image
                                    src={question.imagen_url}
                                    alt="Question Illustration"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}

                        {renderOptions()}

                        {/* Navigation Buttons (Mobile/Contextual) */}
                        <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/5">
                            <button
                                onClick={() => onNavigate(currentQuestionIndex - 1)}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-muted-foreground hover:bg-white/5 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                ← Anterior
                            </button>

                            {isLastQuestion ? (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95"
                                >
                                    Finalizar Intento 🏁
                                </button>
                            ) : (
                                <button
                                    onClick={() => onNavigate(currentQuestionIndex + 1)}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all"
                                >
                                    Siguiente →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper components/logic can go here
