import React, { useState, useEffect } from 'react';

type BlockReason = 'cooldown_active' | 'max_attempts_window' | 'max_attempts_total' | 'attempt_in_progress';

interface CooldownScreenProps {
    reason: BlockReason;
    retryAfterSeconds: number;
    onRetry: () => void;
}

const REASON_CONFIG: Record<BlockReason, { title: string; message: string; icon: string }> = {
    cooldown_active: {
        title: 'Periodo de Enfriamiento',
        message: 'Debes esperar antes de volver a intentarlo',
        icon: 'clock'
    },
    max_attempts_window: {
        title: 'Límite de Intentos Alcanzado',
        message: 'Has alcanzado el límite de intentos en este periodo',
        icon: 'limit'
    },
    max_attempts_total: {
        title: 'Intentos Agotados',
        message: 'Has agotado el número máximo de intentos',
        icon: 'stop'
    },
    attempt_in_progress: {
        title: 'Evaluación en Curso',
        message: 'Ya tienes una evaluación en curso',
        icon: 'progress'
    }
};

export default function CooldownScreen({ reason, retryAfterSeconds, onRetry }: CooldownScreenProps) {
    const [secondsLeft, setSecondsLeft] = useState(retryAfterSeconds);
    const [isComplete, setIsComplete] = useState(retryAfterSeconds <= 0);

    const config = REASON_CONFIG[reason];
    const isBlocked = retryAfterSeconds < 0; // -1 significa bloqueado permanentemente

    useEffect(() => {
        if (isBlocked || secondsLeft <= 0) {
            setIsComplete(true);
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsComplete(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isBlocked, secondsLeft]);

    const formatTime = (seconds: number): string => {
        if (seconds < 0) return '--:--:--';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const renderIcon = () => {
        switch (config.icon) {
            case 'clock':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'limit':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'stop':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                );
            case 'progress':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-2 ring-blue-500/20">
                {renderIcon()}
            </div>

            <h2 className="text-xl font-bold text-white tracking-wide">
                {config.title}
            </h2>

            <p className="text-gray-300 max-w-sm mx-auto text-sm leading-relaxed">
                {config.message}
            </p>

            {!isBlocked && (
                <div className="py-4 px-8 bg-black/20 rounded-lg border border-white/5 backdrop-blur-sm">
                    <span className="text-3xl font-mono text-blue-400 tabular-nums tracking-wider shadow-blue-500/20 drop-shadow-sm">
                        {formatTime(secondsLeft)}
                    </span>
                </div>
            )}

            {isBlocked && (
                <div className="py-3 px-6 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-sm text-red-400 font-medium">
                        No puedes volver a intentar esta evaluación
                    </span>
                </div>
            )}

            <button
                disabled={!isComplete || isBlocked}
                onClick={onRetry}
                className={`mt-6 px-6 py-2 rounded-full text-2xs font-bold uppercase tracking-widest transition-all duration-300 ${isComplete && !isBlocked
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer'
                    : 'bg-white/5 text-gray-400 cursor-not-allowed border border-white/5'
                    }`}
            >
                {isBlocked
                    ? 'Evaluación Bloqueada'
                    : isComplete
                        ? 'Reintentar Evaluación'
                        : `Espera ${secondsLeft}s para reintentar`}
            </button>
        </div>
    );
}
