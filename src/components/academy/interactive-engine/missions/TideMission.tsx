
import React from 'react';
import { MissionData } from '../types';
import TideCalculator from '../../tides/TideCalculator';

interface TideMissionProps {
    data: MissionData;
    onComplete?: (score: number) => void;
}

export const TideMission: React.FC<TideMissionProps> = ({ data, onComplete }) => {
    // If the mission has specific config, pass it
    const config = data.config || {};

    // If this is a 'challenge' mode, we could wrap the calculator with a question form.
    // For now, we just expose the tool for exploration.

    // Automatically complete for exploration (or wait for user action if we add a 'Submit' button)
    // Here we just render the tool.

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <TideCalculator
                initialTime={config.initialTime || "12:00"}
                initialChartDepth={config.initialChartDepth || 5.0}
            />

            {/* Optional Completion Button if it's a task */}
            {onComplete && (
                <button
                    onClick={() => onComplete(100)}
                    className="mt-6 px-6 py-2 bg-accent text-nautical-black font-bold rounded hover:bg-white transition-colors"
                >
                    Continuar Lección
                </button>
            )}
        </div>
    );
};
