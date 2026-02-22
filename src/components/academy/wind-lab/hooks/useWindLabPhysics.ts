import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type DerivedPhysics,
	PhysicsEngine,
	type WindLabState,
} from "../physics/PhysicsEngine";

export const useWindLabPhysics = () => {
	// Initial State
	const [state, setState] = useState<WindLabState>({
		trueWindSpeed: 15, // knots
		trueWindDirection: 0, // North
		boatHeading: 45, // Sailing 45 degrees
		boatSpeed: 0,
		sailAngle: 15, // Tight
		heelAngle: 0,
		rudderAngle: 0,
		angularVelocity: 0,
	});

	const [physics, setPhysics] = useState<DerivedPhysics>(
		PhysicsEngine.calculatePhysics(state),
	);

	const requestRef = useRef<number>();
	const previousTimeRef = useRef<number>();

	// Mutable state for the physics loop to avoid React render cycle in the loop
	const physicsState = useRef<WindLabState>(state);

	const animate = (time: number) => {
		if (previousTimeRef.current !== undefined) {
			// 0. Time Step Safety
			// Clamp deltaTime to max 100ms to prevent "Explosions" on tab switch
			let deltaTime = (time - previousTimeRef.current) / 1000; // Seconds
			if (deltaTime > 0.1) deltaTime = 0.1;

			// 1. Calculate Forces
			const currentPhysics = PhysicsEngine.calculatePhysics(
				physicsState.current,
			);

			// 2. Apply Forces (Newton's Laws simplified)
			// Mass of boat approx 1000kg? We are working in Knots and arbitary force units.
			// Let's assume Force = Acceleration directly for visual feel.

			// Forward Acceleration
			// Drag of hull (water) increases with speed squared.
			const hullDrag =
				physicsState.current.boatSpeed * physicsState.current.boatSpeed * 0.05;
			const netForwardForce = currentPhysics.driveForce - hullDrag;

			// Update Speed
			// Accel = Force / Mass. Let's say Mass = 10.
			let newBoatSpeed =
				physicsState.current.boatSpeed + netForwardForce * deltaTime * 2.0;

			// Safety Clamps for Speed
			if (isNaN(newBoatSpeed)) newBoatSpeed = 0;
			if (newBoatSpeed < 0) newBoatSpeed = 0; // No drifting backwards yet
			if (newBoatSpeed > 50) newBoatSpeed = 50; // Hard max speed

			// --- PHASE 1 & 2: RECONCILED PHYSICS KERNEL (NON-LINEAR + INERTIA) ---

			// 1. Non-linear Steering Effective Speed Curve
			// steerSpeed = max(boatSpeed, 0)
			// speedFactor = steerSpeed / (steerSpeed + 6)
			const steerSpeed = Math.max(physicsState.current.boatSpeed, 0);
			const speedFactor = steerSpeed / (steerSpeed + 6.0);

			// 2. Rudder Force (Angular Acceleration)
			// rudderForce = rudderAngle * speedFactor
			let rudderForce = physicsState.current.rudderAngle * speedFactor;

			// --- LOW SPEED JITTER FIX ---
			if (
				newBoatSpeed < 0.3 &&
				Math.abs(physicsState.current.rudderAngle) < 2.0
			) {
				rudderForce = 0;
			}

			// 3. Update Angular Velocity (Inertia System)
			// angularVelocity += rudderForce * deltaTime
			// Damping = 0.94 per frame (approx 60fps, so 0.94^60 ~= 0.02 per sec residual)
			// Note: rudderForce is arbitrary units. We tune multiplier '4.0' for feel.
			let newAngularVelocity = physicsState.current.angularVelocity || 0;
			newAngularVelocity += rudderForce * deltaTime * 4.0;

			// Apply Angular Damping
			// We want ~6% decay per 16ms frame (0.94 at 60fps)
			// Time-independent formula: vel = vel * pow(decay_per_frame, dt / frame_time)
			const FPS_60_DT = 0.0166;
			newAngularVelocity *= 0.94 ** (deltaTime / FPS_60_DT);

			// Update Heading
			let newHeading = physicsState.current.boatHeading + newAngularVelocity;

			// Safety Normalization for Heading
			if (isNaN(newHeading)) newHeading = 0;
			newHeading = ((newHeading % 360) + 360) % 360;

			// Update Heel
			// Spring-Damper system for heeling
			// Target Heel based on HeelForce
			const targetHeel = Math.min(45, currentPhysics.heelForce * 20); // Max 45 degrees
			// Move towards target
			const heelDiff = targetHeel - physicsState.current.heelAngle;
			let newHeel = physicsState.current.heelAngle + heelDiff * deltaTime * 2.0;

			// Safety Clamp for Heel
			if (isNaN(newHeel)) newHeel = 0;

			// Catastrophic Failure Check (The "God Hand" Reset)
			if (
				isNaN(newBoatSpeed) ||
				isNaN(newHeading) ||
				isNaN(newHeel) ||
				!Number.isFinite(newBoatSpeed)
			) {
				console.warn(
					"[WindLab] Physics Singularity Detected! Hard Resetting Simulation...",
				);
				physicsState.current = {
					...physicsState.current,
					boatSpeed: 0,
					boatHeading: 45,
					heelAngle: 0,
					rudderAngle: 0,
					angularVelocity: 0,
				};
				return;
			}

			// Update Mutable State
			physicsState.current = {
				...physicsState.current,
				boatSpeed: newBoatSpeed,
				boatHeading: newHeading,
				heelAngle: newHeel,
				angularVelocity: newAngularVelocity,
			};

			// Sync with React State (Trottled? Or every frame? React might choke 60fps)
			// For now, let's update React state to trigger re-renders.
			// In a real high-perf game, we'd use refs for UI or canvas.
			// But for this "Lab", React state might be okay if components are optimized.
			// Let's optimize by ONLY updating if meaningful change, or use a ref-based getter for the canvas.
			setPhysics(currentPhysics);
			// We consciously DO NOT update 'state' (setState) every frame to avoid full React re-renders.
			// The Canvas should read from 'physicsState.ref'.
			// Text UI can read from 'physics'.
		}
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(requestRef.current as number);
	}, []);

	// Controls
	const setRudder = useCallback((angle: number) => {
		if (physicsState.current.rudderAngle === angle) return;
		physicsState.current.rudderAngle = angle;
		setState((prev) => ({ ...prev, rudderAngle: angle }));
	}, []);

	const setSailAngle = useCallback((angle: number) => {
		if (physicsState.current.sailAngle === angle) return;
		physicsState.current.sailAngle = angle;
		setState((prev) => ({ ...prev, sailAngle: angle }));
	}, []);

	const setTrueWind = useCallback((speed: number, direction: number) => {
		if (
			physicsState.current.trueWindSpeed === speed &&
			physicsState.current.trueWindDirection === direction
		)
			return;
		physicsState.current.trueWindSpeed = speed;
		physicsState.current.trueWindDirection = direction;
		setState((prev) => ({
			...prev,
			trueWindSpeed: speed,
			trueWindDirection: direction,
		}));
	}, []);

	const controls = useMemo(
		() => ({
			setRudder,
			setSailAngle,
			setTrueWind,
		}),
		[setRudder, setSailAngle, setTrueWind],
	);

	return {
		state: physicsState.current,
		physics,
		controls,
	};
};
