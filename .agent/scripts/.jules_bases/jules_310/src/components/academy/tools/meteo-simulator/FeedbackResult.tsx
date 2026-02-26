'use client';

import React from 'react';
import { MeteoScenario } from '@/data/academy/meteo-scenarios';
import { UserDecision } from './DecisionForm';
import { CheckCircle, AlertOctagon, RefreshCw, Trophy } from 'lucide-react';

interface FeedbackResultProps {
    scenario: MeteoScenario;
    userDecision: UserDecision;
    onNext: () => void;
}

export default function FeedbackResult({ scenario, userDecision, onNext }: FeedbackResultProps) {
    const { correctAnswer } = scenario;

    const isNavigableCorrect = userDecision.navigable === correctAnswer.navigable;
    const isRouteCorrect = userDecision.route_idx === correctAnswer.route_idx;
    const isSailCorrect = userDecision.sail_idx === correctAnswer.sail_idx;

    const score = (Number(isNavigableCorrect) + Number(isRouteCorrect) + Number(isSailCorrect));
    const isPerfect = score === 3;
    const isPass = score >= 2;

    return (
        <div className={`mt-8 p-6 rounded-xl border ${isPass ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPass ? 'bg-emerald-500 text-nautical-black' : 'bg-red-500 text-white'}`}>
                    {isPass ? <Trophy size={24} /> : <AlertOctagon size={24} />}
                </div>
                <div>
                    <h3 className={`text-2xl font-display italic ${isPass ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPerfect ? '¡Decisión Impecable!' : isPass ? 'Buena Decisión' : 'Decisión Peligrosa'}
                    </h3>
                    <p className="text-white/60 text-sm">
                        Has acertado {score}/3 puntos clave.
                    </p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {/* Navigable Feedback */}
                <div className={`p-3 rounded bg-black/20 border ${isNavigableCorrect ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs uppercase font-bold text-white/50">Seguridad</span>
                        {isNavigableCorrect ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span className="text-xs text-red-400 font-bold">INCORRECTO</span>}
                    </div>
                    <p className="text-sm text-white/80">
                        {userDecision.navigable ? "Decidiste zarpar." : "Decidiste quedarte."}
                        {!isNavigableCorrect && (
                            <span className="block text-red-300 mt-1">
                                Lo correcto era: {correctAnswer.navigable ? "Zarpar (es seguro)" : "Quedarse en puerto"}
                            </span>
                        )}
                    </p>
                </div>

                {/* Route Feedback */}
                <div className={`p-3 rounded bg-black/20 border ${isRouteCorrect ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs uppercase font-bold text-white/50">Ruta</span>
                        {isRouteCorrect ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span className="text-xs text-red-400 font-bold">INCORRECTO</span>}
                    </div>
                    <p className="text-sm text-white/80">
                        {scenario.options.route_decision[userDecision.route_idx]}
                        {!isRouteCorrect && (
                            <span className="block text-red-300 mt-1">
                                Mejor opción: {scenario.options.route_decision[correctAnswer.route_idx]}
                            </span>
                        )}
                    </p>
                </div>

                {/* Sail Feedback */}
                <div className={`p-3 rounded bg-black/20 border ${isSailCorrect ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs uppercase font-bold text-white/50">Velas</span>
                        {isSailCorrect ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span className="text-xs text-red-400 font-bold">INCORRECTO</span>}
                    </div>
                    <p className="text-sm text-white/80">
                        {scenario.options.sail_plan[userDecision.sail_idx]}
                        {!isSailCorrect && (
                            <span className="block text-red-300 mt-1">
                                Mejor opción: {scenario.options.sail_plan[correctAnswer.sail_idx]}
                            </span>
                        )}
                    </p>
                </div>

                {/* Explanation */}
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded text-sm text-blue-100 italic">
                    <span className="font-bold not-italic block mb-2 text-blue-300 uppercase text-xs tracking-widest">Análisis del Instructor:</span>
                    "{scenario.explanation}"
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-4 h-4" /> Siguiente Escenario
            </button>
        </div>
    );
}
