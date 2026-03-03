'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface FeedbackPlayerProps {
    text?: string;
    audioUrl?: string;
}

export default function FeedbackPlayer({ text, audioUrl }: FeedbackPlayerProps) {
    if (!text && !audioUrl) return null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-accent font-bold mb-2">Feedback del Instructor</h4>

            {text && (
                <p className="text-sm text-white/80 italic font-serif leading-relaxed">
                    "{text}"
                </p>
            )}

            {audioUrl && (
                <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                    <button
                        onClick={() => new Audio(audioUrl).play()}
                        className="w-8 h-8 flex items-center justify-center bg-accent text-nautical-black rounded-full hover:scale-105 transition-transform"
                    >
                        <Play size={14} fill="currentColor" />
                    </button>
                    <span className="text-xs text-white/50 font-mono uppercase tracking-wider">Audio Comentario</span>
                </div>
            )}
        </div>
    );
}
