'use client';

import React, { useState } from 'react';
import { FlashcardData } from '@/lib/academy/flashcards-data';

interface FlashcardProps {
    data: FlashcardData;
    isFlipped: boolean;
    onFlip: () => void;
}

export default function Flashcard({ data, isFlipped, onFlip }: FlashcardProps) {
    return (
        <div
            className="w-full max-w-md aspect-[3/2] perspective-1000 cursor-pointer group"
            onClick={onFlip}
        >
            <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-white/5 border border-white/10 p-8 flex flex-col items-center justify-center text-center shadow-xl group-hover:border-accent/40 transition-colors">
                    <div className="absolute top-4 right-4 text-2xs font-black uppercase tracking-widest text-white/20">
                        {data.category}
                    </div>

                    {data.front.type === 'text' && (
                        <>
                            <p className="text-xl md:text-2xl font-light text-white leading-relaxed">
                                {data.front.content}
                            </p>
                            {data.front.label && (
                                <span className="mt-4 text-sm text-accent font-bold uppercase tracking-widest">
                                    {data.front.label}
                                </span>
                            )}
                        </>
                    )}

                    <div className="absolute bottom-4 text-3xs text-white/40 uppercase tracking-widest animate-pulse">
                        Clic para voltear
                    </div>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-accent text-nautical-black p-8 flex flex-col items-center justify-center text-center shadow-xl">
                    <h3 className="text-2xl md:text-3xl font-display italic mb-4">
                        {data.back.title}
                    </h3>
                    <p className="text-sm md:text-base font-medium leading-relaxed max-w-sm">
                        {data.back.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
