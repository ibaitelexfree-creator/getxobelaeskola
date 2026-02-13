'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface TrimFeedbackProps {
    currentSailAngle: number;
    optimalSailAngle: number;
    efficiency: number;
    isStalled: boolean;
}

export const TrimFeedback: React.FC<TrimFeedbackProps> = ({
    currentSailAngle,
    optimalSailAngle,
    efficiency,
    isStalled
}) => {
    // Calculate trim delta
    const delta = Math.abs(currentSailAngle - optimalSailAngle);

    const t = useTranslations('wind_lab');

    // Determine status
    const getStatus = () => {
        if (isStalled) return { label: t('feedback.stall'), color: 'text-red-500', icon: '❌', bg: 'bg-red-500/20 border-red-500' };
        if (delta < 5) return { label: t('feedback.perfect'), color: 'text-emerald-400', icon: '✅', bg: 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' };
        if (delta < 15) return { label: t('feedback.good'), color: 'text-cyan-400', icon: '⚠️', bg: 'bg-cyan-500/20 border-cyan-500' };
        return { label: t('feedback.poor'), color: 'text-yellow-500', icon: '⚠️', bg: 'bg-yellow-500/20 border-yellow-500' };
    };

    const status = getStatus();

    // Accuracy percentage
    const accuracy = Math.max(0, 100 - (delta * 2));

    return (
        <div className={`flex items-center justify-between p-2 md:p-3 rounded-lg border backdrop-blur-md transition-all duration-300 ${status.bg}`}>
            <div className="flex flex-col">
                <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest">{t('feedback.label')}</span>
                <span className={`text-sm font-black italic flex items-center gap-2 ${status.color}`}>
                    {status.icon} {status.label}
                </span>
            </div>

            <div className="text-right">
                <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest">{t('feedback.accuracy')}</span>
                <div className="text-xl font-mono font-bold text-white">{accuracy.toFixed(0)}%</div>
            </div>
        </div>
    );
};
