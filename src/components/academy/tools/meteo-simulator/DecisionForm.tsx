'use client';

import React, { useState } from 'react';
import { MeteoScenario } from '@/data/academy/meteo-scenarios';
import { Check, X, Anchor, ArrowRight, Sailboat, Map } from 'lucide-react';

interface DecisionFormProps {
    scenario: MeteoScenario;
    onSubmit: (decision: UserDecision) => void;
    submitted: boolean;
}

export interface UserDecision {
    navigable: boolean;
    route_idx: number;
    sail_idx: number;
}

export default function DecisionForm({ scenario, onSubmit, submitted }: DecisionFormProps) {
    const [navigable, setNavigable] = useState<boolean | null>(null);
    const [routeIdx, setRouteIdx] = useState<number | null>(null);
    const [sailIdx, setSailIdx] = useState<number | null>(null);

    const handleSubmit = () => {
        if (navigable === null || routeIdx === null || sailIdx === null) return;
        onSubmit({
            navigable,
            route_idx: routeIdx,
            sail_idx: sailIdx
        });
    };

    const isComplete = navigable !== null && routeIdx !== null && sailIdx !== null;

    return (
        <div className="space-y-8 bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-display italic text-white mb-4 flex items-center gap-2">
                <span className="text-accent">?</span> Tu Decisión
            </h3>

            {/* 1. Navigable Decision */}
            <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-white/60 block">
                    1. ¿Es seguro salir a navegar?
                </label>
                <div className="flex gap-4">
                    <button
                        onClick={() => !submitted && setNavigable(true)}
                        disabled={submitted}
                        className={`flex-1 p-4 rounded-lg border transition-all flex items-center justify-center gap-2
                            ${navigable === true
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-white/5 border-white/10 hover:border-emerald-500/50 text-white/60 hover:text-white'
                            } ${submitted && navigable !== true ? 'opacity-50' : ''}`}
                    >
                        <Check className="w-5 h-5" />
                        SÍ, ES SEGURO
                    </button>
                    <button
                        onClick={() => !submitted && setNavigable(false)}
                        disabled={submitted}
                        className={`flex-1 p-4 rounded-lg border transition-all flex items-center justify-center gap-2
                            ${navigable === false
                                ? 'bg-red-500 text-white border-red-400'
                                : 'bg-white/5 border-white/10 hover:border-red-500/50 text-white/60 hover:text-white'
                            } ${submitted && navigable !== false ? 'opacity-50' : ''}`}
                    >
                        <X className="w-5 h-5" />
                        NO, ES PELIGROSO
                    </button>
                </div>
            </div>

            {/* 2. Route Decision */}
            <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-white/60 block flex items-center gap-2">
                    <Map className="w-4 h-4" /> 2. Estrategia de Ruta
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {scenario.options.route_decision.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => !submitted && setRouteIdx(idx)}
                            disabled={submitted}
                            className={`text-left p-3 rounded border transition-all text-sm
                                ${routeIdx === idx
                                    ? 'bg-accent text-nautical-black border-accent font-bold'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                                } ${submitted && routeIdx !== idx ? 'opacity-50' : ''}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Sail Plan */}
            <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-white/60 block flex items-center gap-2">
                    <Sailboat className="w-4 h-4" /> 3. Plan Vélico / Configuración
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {scenario.options.sail_plan.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => !submitted && setSailIdx(idx)}
                            disabled={submitted}
                            className={`text-left p-3 rounded border transition-all text-sm
                                ${sailIdx === idx
                                    ? 'bg-accent text-nautical-black border-accent font-bold'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                                } ${submitted && sailIdx !== idx ? 'opacity-50' : ''}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            {!submitted && (
                <button
                    onClick={handleSubmit}
                    disabled={!isComplete}
                    className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                        ${isComplete
                            ? 'bg-accent hover:bg-white text-nautical-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'bg-white/10 text-white/20 cursor-not-allowed'
                        }`}
                >
                    <Anchor className="w-5 h-5" /> Confirmar Decisión
                </button>
            )}
        </div>
    );
}
