import { useCallback, useEffect, useRef } from "react";
import { WindLabAudio } from "../audio/AudioEngine";
import type { DerivedPhysics, WindLabState } from "../physics/PhysicsEngine";

export const useWindLabAudio = (
	state: WindLabState,
	physics: DerivedPhysics,
) => {
	const audioRef = useRef<WindLabAudio | null>(null);

	useEffect(() => {
		// Initialize Audio Engine once
		if (!audioRef.current) {
			audioRef.current = new WindLabAudio();
		}

		// Cleanup on unmount
		return () => {
			if (audioRef.current) {
				// Ideally close context or mute
				// audioRef.current.close();
			}
		};
	}, []);

	// Update audio parameters on every physics change
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.update(
				physics.apparentWindSpeed,
				physics.efficiency,
				physics.mainIsStalled || physics.jibIsStalled,
			);
		}
	}, [physics]);

	const toggleAudio = useCallback(async (shouldMute: boolean) => {
		if (audioRef.current) {
			await audioRef.current.init(); // Ensure init
			await audioRef.current.toggleMute(shouldMute);
		}
	}, []);

	const playWinchClick = useCallback(() => {
		if (audioRef.current) {
			// We can throttle this if needed
			audioRef.current.playWinchClick();
		}
	}, []);

	return {
		toggleAudio,
		playWinchClick,
	};
};
