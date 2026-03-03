'use client';

import React, { useState } from 'react';

export interface RubricCriterion {
    id: string;
    label: string;
    maxPoints: number;
    description?: string;
}

interface RubricFormProps {
    rubric: RubricCriterion[];
    onChange: (scores: Record<string, number>, totalScore: number) => void;
}

export default function RubricForm({ rubric, onChange }: RubricFormProps) {
    const [localScores, setLocalScores] = useState<Record<string, number>>({});

    const handleScoreChange = (id: string, value: number) => {
        const newScores = { ...localScores, [id]: value };
        setLocalScores(newScores);

        // Calculate total score based on sum of points (assuming maxPoints sum to 100 or simply raw points)
        // If we want a 0-100 score, we normalize.
        let currentPoints = 0;
        let maxPossible = 0;

        rubric.forEach(c => {
            currentPoints += newScores[c.id] || 0;
            maxPossible += c.maxPoints;
        });

        const normalizedScore = maxPossible > 0
            ? Math.round((currentPoints / maxPossible) * 100)
            : 0;

        onChange(newScores, normalizedScore);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-display italic text-white mb-4">Rúbrica de Evaluación</h3>
            <div className="grid gap-6">
                {rubric.map((criterion) => (
                    <div key={criterion.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-accent/30 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-white text-lg">{criterion.label}</h4>
                            <span className="text-accent font-mono text-sm">Max: {criterion.maxPoints} pts</span>
                        </div>
                        {criterion.description && (
                            <p className="text-sm text-white/70 mb-4 font-light">{criterion.description}</p>
                        )}
                        <input
                            type="range"
                            min="0"
                            max={criterion.maxPoints}
                            value={localScores[criterion.id] || 0}
                            onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                        <div className="text-right mt-2 font-mono text-accent font-bold text-lg">
                            {localScores[criterion.id] || 0} <span className="text-sm text-white/50">/ {criterion.maxPoints}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
