
import React from 'react';
import { MissionStep } from '../../types';

interface StepProps {
    step: MissionStep;
    onOptionSelect: (index: number) => void;
}

export const QuestionStep: React.FC<StepProps> = ({ step, onOptionSelect }) => {
    const { title, body } = step.content;
    const options = step.options || [];

    return (
        <div className="space-y-6">
             <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-display italic text-accent mb-2">Pregunta Táctica</h3>
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <p className="text-white/80 text-lg mb-8">{body}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => onOptionSelect(idx)}
                        className="text-left p-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/60 group-hover:border-accent group-hover:text-accent">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-white/90 group-hover:text-white font-medium">
                                {opt.label}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
