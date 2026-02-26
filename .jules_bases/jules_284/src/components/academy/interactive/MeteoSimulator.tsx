'use client';

import React, { useState, useEffect } from 'react';
import { MeteoScenario } from '@/lib/academy/meteo-scenarios';
import { CheckCircle, AlertTriangle, HelpCircle, Wind, Anchor, Ship, FileText } from 'lucide-react';

interface MeteoSimulatorProps {
    scenario: MeteoScenario;
}

export default function MeteoSimulator({ scenario }: MeteoSimulatorProps) {
    // State
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [submitted, setSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    // Reset when scenario changes
    useEffect(() => {
        setUserAnswers({});
        setSubmitted(false);
        setShowExplanation(false);
    }, [scenario.id]);

    const handleSelect = (questionId: string, optionId: string) => {
        if (submitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const checkAnswers = () => {
        setSubmitted(true);
        setShowExplanation(true);
    };

    const isCorrect = (questionId: string) => {
        return userAnswers[questionId] === scenario.correctAnswers[questionId];
    };

    const allCorrect = Object.keys(scenario.correctAnswers).every(qId => isCorrect(qId));
    const allAnswered = scenario.questions.every(q => userAnswers[q.id]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Column: The Report */}
            <div className="flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wind className="w-24 h-24 text-white" />
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="text-accent w-6 h-6" />
                        <h3 className="text-xl font-display italic text-white tracking-wide">Parte Meteorológico</h3>
                    </div>

                    <div className="bg-nautical-black/50 p-6 rounded-lg border border-white/5 font-mono text-sm leading-relaxed text-emerald-100/90 whitespace-pre-wrap shadow-inner">
                        {scenario.report}
                    </div>

                    <div className="mt-6 flex justify-between items-center text-xs uppercase tracking-widest text-white/40">
                        <span>Dificultad: <strong className={scenario.difficulty === 'Básico' ? 'text-green-400' : scenario.difficulty === 'Intermedio' ? 'text-yellow-400' : 'text-red-400'}>{scenario.difficulty}</strong></span>
                        <span>ID: {scenario.id}</span>
                    </div>
                </div>

                {/* Feedback / Explanation Area (Visible after submit) */}
                {submitted && (
                    <div className={`p-6 rounded-xl border transition-all duration-500 animate-fade-in
                        ${allCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                            : 'bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]'}
                    `}>
                        <div className="flex items-center gap-3 mb-4">
                            {allCorrect ? (
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            )}
                            <h4 className={`text-xl font-display italic ${allCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                {allCorrect ? '¡Decisión Correcta!' : 'Análisis Incorrecto'}
                            </h4>
                        </div>

                        <p className="text-white/80 leading-relaxed text-sm">
                            {scenario.explanation}
                        </p>
                    </div>
                )}
            </div>

            {/* Right Column: The Questions Form */}
            <div className="flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-display italic text-white mb-6 flex items-center gap-2">
                        <Ship className="w-5 h-5 text-accent" />
                        Toma de Decisiones
                    </h3>

                    <div className="space-y-8 flex-1">
                        {scenario.questions.map((q, idx) => {
                            const answered = !!userAnswers[q.id];
                            const correct = isCorrect(q.id);

                            return (
                                <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <h4 className="text-sm font-bold text-white mb-3 flex items-start gap-2">
                                        <span className="bg-white/10 w-6 h-6 rounded flex items-center justify-center text-xs text-accent shrink-0 mt-0.5">{idx + 1}</span>
                                        {q.text}
                                    </h4>

                                    <div className="space-y-2 pl-8">
                                        {q.options.map((opt) => {
                                            const isSelected = userAnswers[q.id] === opt.id;
                                            const isCorrectOption = scenario.correctAnswers[q.id] === opt.id;

                                            let styles = "border-white/10 hover:bg-white/5 text-white/60";

                                            if (submitted) {
                                                if (isCorrectOption) {
                                                    styles = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold";
                                                } else if (isSelected && !isCorrectOption) {
                                                    styles = "bg-red-500/20 border-red-500/50 text-red-300 line-through opacity-70";
                                                } else {
                                                    styles = "border-transparent opacity-30 grayscale";
                                                }
                                            } else {
                                                if (isSelected) {
                                                    styles = "bg-accent text-nautical-black border-accent font-bold shadow-[0_0_15px_rgba(255,191,0,0.2)]";
                                                }
                                            }

                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleSelect(q.id, opt.id)}
                                                    disabled={submitted}
                                                    className={`w-full text-left p-3 rounded border text-sm transition-all duration-200 flex items-center justify-between group ${styles}`}
                                                >
                                                    <span>{opt.text}</span>
                                                    {submitted && isCorrectOption && <CheckCircle className="w-4 h-4" />}
                                                    {!submitted && isSelected && <div className="w-2 h-2 bg-nautical-black rounded-full" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <button
                            onClick={checkAnswers}
                            disabled={!allAnswered || submitted}
                            className={`w-full py-4 rounded font-black uppercase tracking-widest text-sm transition-all duration-300
                                ${!allAnswered
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                    : submitted
                                        ? 'bg-white/10 text-white/40 cursor-default'
                                        : 'bg-accent text-nautical-black hover:bg-white hover:scale-[1.02] shadow-lg'}
                            `}
                        >
                            {submitted ? (allCorrect ? '¡Completado con Éxito!' : 'Revisar Fallos') : 'Analizar Situación'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
