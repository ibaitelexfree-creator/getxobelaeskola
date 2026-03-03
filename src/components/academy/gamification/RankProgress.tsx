'use client';

import React from 'react';
import Image from 'next/image';
import { Rank, getNextRank } from '@/lib/gamification/ranks';

interface RankProgressProps {
    currentXP: number;
    currentRank: Rank;
}

export default function RankProgress({ currentXP, currentRank }: RankProgressProps) {
    const nextRank = getNextRank(currentRank.id);

    // Calculate progress percentage relative to current rank range
    let progressPercent = 100;
    let nextXP = currentRank.minXP;

    if (nextRank) {
        const range = nextRank.minXP - currentRank.minXP;
        const current = currentXP - currentRank.minXP;
        progressPercent = Math.min(100, Math.max(0, (current / range) * 100));
        nextXP = nextRank.minXP;
    }

    const isImage = currentRank.icon.startsWith('/');

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">

                {/* Rank Icon */}
                <div className="flex-shrink-0">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/10 flex items-center justify-center bg-nautical-black relative overflow-hidden shadow-lg shadow-black/50`}>
                        {isImage ? (
                            <Image
                                src={currentRank.icon}
                                alt={currentRank.name}
                                fill
                                className="object-contain p-2 hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <span className="text-4xl md:text-5xl">{currentRank.icon}</span>
                        )}
                        <div className={`absolute inset-0 bg-accent/10 blur-[20px] opacity-50`} />
                    </div>
                </div>

                {/* Info & Progress */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-2 gap-2">
                        <div>
                            <div className={`text-2xs font-black uppercase tracking-[0.2em] mb-1 ${currentRank.color}`}>
                                Rango Actual
                            </div>
                            <h3 className="text-2xl md:text-3xl font-display italic text-white leading-none">
                                {currentRank.name}
                            </h3>
                        </div>
                        <div className="text-right">
                            <div className="text-2xs uppercase tracking-widest text-white/40 mb-1">XP Total</div>
                            <div className="text-xl font-bold text-accent font-mono">{currentXP.toLocaleString()} <span className="text-2xs text-white/40">XP</span></div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="h-3 bg-nautical-black rounded-full overflow-hidden border border-white/5 relative">
                            <div
                                className="h-full bg-gradient-to-r from-accent/80 to-accent transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,191,0,0.3)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                            {/* Stripes pattern overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
                        </div>

                        <div className="flex justify-between items-center text-3xs uppercase tracking-wider font-bold text-white/30">
                            <span>{currentRank.minXP} XP</span>
                            {nextRank ? (
                                <span>{nextXP} XP ({nextRank.name})</span>
                            ) : (
                                <span>Rango Máximo</span>
                            )}
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-white/60 font-light leading-snug">
                        {currentRank.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
