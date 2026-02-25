'use client';

import React, { useState, useEffect } from 'react';
import AccessibleModal from '@/components/shared/AccessibleModal';
import { QuestionData } from './types';
import { Check, X, AlertCircle } from 'lucide-react';

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCorrect: () => void;
    question: QuestionData;
}

export default function QuizModal({ isOpen, onClose, onCorrect, question }: QuizModalProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Reset state when question changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedOptionId(null);
            setIsSubmitted(false);
            setIsCorrect(false);
        }
    }, [isOpen, question]);

    const handleOptionSelect = (optionId: string) => {
        if (isSubmitted) return;
        setSelectedOptionId(optionId);
    };

    const handleSubmit = () => {
        if (!selectedOptionId) return;

        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        if (!selectedOption) return;

        const correct = selectedOption.isCorrect;
        setIsSubmitted(true);
        setIsCorrect(correct);

        if (correct) {
            // Optional: Auto-close after a delay? Or let user click "Continue".
            // For now, let user click "Continue".
        }
    };

    const handleContinue = () => {
        if (isCorrect) {
            onCorrect();
        } else {
            // Reset to try again? Or force them to watch again?
            // Usually in interactive video, you can try again or are forced to rewatch a segment.
            // For simplicity: Allow retry.
            setIsSubmitted(false);
            setSelectedOptionId(null);
        }
    };

    return (
        <AccessibleModal
            isOpen={isOpen}
            onClose={onClose} // This allows closing via 'X' or outside click. Depending on strictness, we might want to disable this.
            title="Pregunta de Repaso"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                <div className="text-lg font-medium text-white">
                    {question.text}
                </div>

                <div className="space-y-3">
                    {question.options.map((option) => {
                        let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group";

                        if (isSubmitted) {
                            if (option.id === selectedOptionId) {
                                if (option.isCorrect) {
                                    buttonClass += " bg-green-500/10 border-green-500/50 text-green-400";
                                } else {
                                    buttonClass += " bg-red-500/10 border-red-500/50 text-red-400";
                                }
                            } else if (option.isCorrect) {
                                buttonClass += " bg-green-500/5 border-green-500/30 text-green-400/70"; // Show correct answer
                            } else {
                                buttonClass += " bg-white/5 border-white/10 text-white/30";
                            }
                        } else {
                            if (option.id === selectedOptionId) {
                                buttonClass += " bg-accent/10 border-accent text-white";
                            } else {
                                buttonClass += " bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20";
                            }
                        }

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleOptionSelect(option.id)}
                                disabled={isSubmitted}
                                className={buttonClass}
                            >
                                <span>{option.text}</span>
                                {isSubmitted && option.id === selectedOptionId && (
                                    option.isCorrect ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {isSubmitted && (
                    <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-start gap-3">
                            {isCorrect ? (
                                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                                <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                                </p>
                                {question.explanation && (
                                    <p className="text-sm text-white/70 mt-1">
                                        {question.explanation}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOptionId}
                            className="px-6 py-2 bg-accent text-nautical-black font-bold uppercase tracking-wide rounded-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Comprobar
                        </button>
                    ) : (
                        <button
                            onClick={handleContinue}
                            className="px-6 py-2 bg-accent text-nautical-black font-bold uppercase tracking-wide rounded-sm hover:bg-white transition-colors"
                        >
                            {isCorrect ? 'Continuar Video' : 'Intentar de nuevo'}
                        </button>
                    )}
                </div>
            </div>
        </AccessibleModal>
    );
}
