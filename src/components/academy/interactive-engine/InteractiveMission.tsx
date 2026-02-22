"use client";

import type React from "react";
import { useEffect } from "react";
import { MissionCanvas } from "./MissionCanvas"; // The Factory
import MissionErrorBoundary from "./MissionErrorBoundary";
import { MissionFeedback } from "./MissionFeedback";
import { MissionHeader } from "./MissionHeader";
import { useMissionStore } from "./store";
import type { MissionData } from "./types";

interface InteractiveMissionProps {
	data: MissionData;
	onComplete?: (score: number) => void;
}

export const InteractiveMission: React.FC<InteractiveMissionProps> = ({
	data,
	onComplete,
}) => {
	// Access store actions and state
	const { startMission, reset, status, score, setFeedback } = useMissionStore();

	// Reset and Initialize on mount or data change
	useEffect(() => {
		reset();
		// Identify mission type and potential max score from data if needed
		startMission();

		return () => reset(); // Cleanup
	}, [data, reset, startMission]);

	// Handle Completion
	useEffect(() => {
		if (status === "completed" && onComplete) {
			onComplete(score);
		}
	}, [status, score, onComplete]);

	if (!data || !data.tipo_contenido) {
		return <div className="p-4 text-red-500">Error: Invalid Mission Data</div>;
	}

	return (
		<MissionErrorBoundary>
			<div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-white/10 bg-nautical-black/50 backdrop-blur-sm shadow-2xl">
				{/* Header: Title, Score, Status */}
				<MissionHeader
					title={data.titulo || "Misión Interactiva"}
					timerSeconds={data.config?.timer_seconds || 0}
				/>

				{/* Main Game Area: Dynamic Component based on Type */}
				<div className="relative min-h-[400px] flex flex-col">
					<MissionCanvas
						missionData={data}
						onComplete={(score) => {
							// This handles internal completion logic if needed,
							// but the store action 'completeMission' usually triggers the status change
							// which then triggers the useEffect above.
							// However, some missions might call this prop directly.
						}}
					/>
				</div>

				{/* Feedback Overlay: Success/Fail messages */}
				<MissionFeedback
					onRetry={() => {
						reset();
						startMission();
					}}
					onNext={() => {
						// Optional: Navigate to next unit or close modal
						console.log("Next clicked");
					}}
				/>
			</div>
		</MissionErrorBoundary>
	);
};
