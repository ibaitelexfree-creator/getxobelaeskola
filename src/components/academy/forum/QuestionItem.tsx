'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuestionItemProps {
    question: any;
    onClick: () => void;
}

export default function QuestionItem({ question, onClick }: QuestionItemProps) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-6 glass-card hover:bg-white/[0.02] border-white/5 hover:border-accent/30 transition-all duration-300 group"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="text-xl font-display italic text-white group-hover:text-accent transition-colors mb-2">
                        {question.titulo}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/50 font-medium">
                        <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-white/40">
                                {question.profiles?.nombre?.[0] || '?'}
                            </span>
                            {question.profiles?.nombre}
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: es })}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-[10px] uppercase tracking-widest font-bold">
                    <div className={`px-2 py-1 rounded border ${question.votos > 0 ? 'text-accent border-accent/20 bg-accent/5' : 'text-white/30 border-white/10'}`}>
                        {question.votos} Votos
                    </div>
                    <div className={`px-2 py-1 rounded border ${question.respuestas_count > 0 ? 'text-white/70 border-white/20' : 'text-white/30 border-white/10'}`}>
                        {question.respuestas_count} Respuestas
                    </div>
                </div>
            </div>
        </button>
    );
}
