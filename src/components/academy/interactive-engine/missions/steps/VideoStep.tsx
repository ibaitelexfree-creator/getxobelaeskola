
import React from 'react';
import { MissionStep } from '../../types';

interface StepProps {
    step: MissionStep;
    onOptionSelect: (index: number) => void;
}

export const VideoStep: React.FC<StepProps> = ({ step, onOptionSelect }) => {
    const { title, body, media_url } = step.content;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-display italic text-accent mb-2">Video Educativo</h3>

            {media_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/10">
                    <video
                        src={media_url}
                        controls
                        className="w-full h-full object-cover"
                        poster={step.content.thumbnail_url}
                    />
                </div>
            )}

            <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-white/80">{body}</p>
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    onClick={() => onOptionSelect(0)}
                    className="px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};
