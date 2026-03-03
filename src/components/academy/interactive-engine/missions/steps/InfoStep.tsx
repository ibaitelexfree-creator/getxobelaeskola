
import React from 'react';
import { MissionStep } from '../../types';

interface StepProps {
    step: MissionStep;
    onOptionSelect: (index: number) => void;
}

export const InfoStep: React.FC<StepProps> = ({ step, onOptionSelect }) => {
    const { title, body, media_url } = step.content;
    const nextOption = step.options?.[0]; // Usually just one 'Next' option

    return (
        <div className="space-y-6">
            {media_url && (
                <div className="rounded-lg overflow-hidden border border-white/10">
                    <img src={media_url} alt={title} className="w-full h-auto object-cover max-h-64" />
                </div>
            )}

            <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-display italic text-white mb-4">{title}</h3>
                <p className="text-white/80 text-lg leading-relaxed whitespace-pre-line">{body}</p>
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    onClick={() => onOptionSelect(0)}
                    className="px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
                >
                    {nextOption?.label || 'Continuar'}
                </button>
            </div>
        </div>
    );
};
