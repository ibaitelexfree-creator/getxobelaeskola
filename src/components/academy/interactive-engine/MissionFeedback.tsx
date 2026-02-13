
import React from 'react';
import { useMissionStore } from './store';

interface FeedbackProps {
    onRetry?: () => void;
    onNext?: () => void;
}

export const MissionFeedback: React.FC<FeedbackProps> = ({ onRetry, onNext }) => {
    const { feedbackMessage, feedbackType, status } = useMissionStore();

    if (!feedbackMessage) return null;

    const isSuccess = feedbackType === 'success';
    const isError = feedbackType === 'error';
    const isInfo = feedbackType === 'info';

    return (
        <div className={`
            absolute inset-x-0 bottom-0 p-6 backdrop-blur-md border-t border-white/10
            ${isSuccess ? 'bg-green-500/10 border-green-500/30' : ''}
            ${isError ? 'bg-red-500/10 border-red-500/30' : ''}
            ${isInfo ? 'bg-blue-500/10 border-blue-500/30' : ''}
            transition-all duration-300 transform translate-y-0
        `}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className={`text-2xl ${isSuccess ? 'text-green-400' : isError ? 'text-red-400' : 'text-blue-400'
                        }`}>
                        {isSuccess ? '✓' : isError ? '✕' : 'ℹ'}
                    </span>
                    <p className={`text-sm font-medium ${isSuccess ? 'text-green-100' : isError ? 'text-red-100' : 'text-blue-100'
                        }`}>
                        {feedbackMessage}
                    </p>
                </div>

                <div className="flex gap-2">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-2xs font-bold uppercase rounded"
                        >
                            Reintentar
                        </button>
                    )}
                    {onNext && (
                        <button
                            onClick={onNext}
                            className="px-6 py-2 bg-accent text-nautical-black text-2xs font-bold uppercase rounded hover:bg-white"
                        >
                            Continuar →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
