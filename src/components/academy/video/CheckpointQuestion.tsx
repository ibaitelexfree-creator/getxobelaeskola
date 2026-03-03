'use client';

import React, { useState } from 'react';

interface CheckpointQuestionProps {
    question: string;
    options: string[];
    correctOptionIndex: number;
    onCorrect: () => void;
    onIncorrect?: () => void;
}

export default function CheckpointQuestion({
    question,
    options,
    correctOptionIndex,
    onCorrect,
    onIncorrect
}: CheckpointQuestionProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSubmit = () => {
        if (selectedOption === null) return;
        setSubmitted(true);
        const correct = selectedOption === correctOptionIndex;
        setIsCorrect(correct);
        if (correct) {
            setTimeout(() => {
                onCorrect();
            }, 1500); // Delay to show success message
        } else {
            if (onIncorrect) onIncorrect();
        }
    };

    const handleRetry = () => {
        setSubmitted(false);
        setIsCorrect(false);
        setSelectedOption(null);
    };

    return (
        <div className="bg-nautical-black/90 backdrop-blur-md p-8 rounded-lg border border-white/20 max-w-2xl w-full mx-auto shadow-2xl animate-fade-in text-white">
            <h3 className="text-xl md:text-2xl font-display italic mb-6 text-center">{question}</h3>

            <div className="space-y-4 mb-8">
                {options.map((option, index) => {
                    let optionClass = "w-full p-4 rounded-md border text-left transition-all duration-300 ";

                    if (submitted) {
                        if (index === correctOptionIndex) {
                            optionClass += "bg-green-500/20 border-green-500 text-green-200";
                        } else if (index === selectedOption) {
                            optionClass += "bg-red-500/20 border-red-500 text-red-200";
                        } else {
                            optionClass += "bg-white/5 border-white/10 opacity-50";
                        }
                    } else {
                        if (selectedOption === index) {
                            optionClass += "bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10 scale-[1.02]";
                        } else {
                            optionClass += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30";
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => !submitted && setSelectedOption(index)}
                            disabled={submitted}
                            className={optionClass}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold
                                    ${submitted && index === correctOptionIndex ? 'border-green-500 bg-green-500 text-nautical-black' :
                                      submitted && index === selectedOption ? 'border-red-500 bg-red-500 text-white' :
                                      selectedOption === index ? 'border-accent bg-accent text-nautical-black' :
                                      'border-white/30 text-white/50'}
                                `}>
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <span>{option}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-center">
                {!submitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        className="px-8 py-3 bg-accent text-nautical-black font-black uppercase tracking-widest rounded-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Responder
                    </button>
                ) : (
                    isCorrect ? (
                        <div className="text-green-400 font-bold flex items-center gap-2 animate-bounce-slow">
                            <span className="text-2xl">✓</span> ¡Correcto! Continuando...
                        </div>
                    ) : (
                        <button
                            onClick={handleRetry}
                            className="px-8 py-3 bg-red-500 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-red-600 transition-all"
                        >
                            Intentar de nuevo
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
