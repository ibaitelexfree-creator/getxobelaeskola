import { useRef, useCallback, useState } from 'react';
import { WindPhysicsState, PhysicsDifficulty } from '../types';
import { stepPhysics } from '../physics/physicsStep';
import { PHYSICS_CONSTANTS } from '../physics/constants';

interface UseWindPhysicsProps {
    difficulty: PhysicsDifficulty;
    initialWindSpeed?: number;
    initialWindDirection?: number;
}

/**
 * Hook to manage the physics engine.
 * 
 * Returns:
 * - physicsState: Mutable Ref to the current state (Use this for 60fps Canvas drawing)
 * - setSailAngle: Function to update control input
 * - setWindDirection: Function to update environment input
 * - resetPhysics: Function to reset state
 * - runPhysicsStep: Function to be called inside requestAnimationFrame
 */
export function useWindPhysics({
    difficulty = 'beginner',
    initialWindSpeed = 15,
    initialWindDirection = 45
}: UseWindPhysicsProps) {

    // 1. The Source of Truth (Mutable Ref)
    // We use a Ref to avoid React re-renders on every frame.
    const physicsState = useRef<WindPhysicsState>({
        // Inputs
        windSpeed: initialWindSpeed,
        windDirection: initialWindDirection,
        sailAngle: 0,
        boatHeading: 0,

        // Simulation State
        boatSpeed: 0,

        // Outputs (Initial defaults)
        apparentWindSpeed: initialWindSpeed,
        apparentWindAngle: initialWindDirection,
        angleOfAttack: 0,
        liftCoefficient: 0,
        dragCoefficient: 0,
        forwardForce: 0,
        sideForce: 0,
        heelAngle: 0,
        efficiency: 0,
        isLuffing: true,
        isStalled: false
    });

    // 2. Control Handlers (Update Inputs)
    const setSailAngle = useCallback((angle: number) => {
        physicsState.current.sailAngle = angle;
    }, []);

    const setWindDirection = useCallback((direction: number) => {
        physicsState.current.windDirection = direction;
    }, []);

    const setWindSpeed = useCallback((speed: number) => {
        physicsState.current.windSpeed = speed;
    }, []);

    // 3. The Physics Loop Step
    // This should be called by the parent's requestAnimationFrame loop using `useGameLoop`
    const runPhysicsStep = useCallback((dt: number = PHYSICS_CONSTANTS.DT) => {
        // Run the pure function
        const newState = stepPhysics(physicsState.current, dt);

        // Update the ref (Mutation is intended here for performance)
        physicsState.current = newState;

        return newState;
    }, []);

    const resetPhysics = useCallback(() => {
        physicsState.current = {
            ...physicsState.current,
            boatSpeed: 0,
            heelAngle: 0,
            forwardForce: 0,
            sideForce: 0,
            efficiency: 0
        };
    }, []);

    return {
        physicsState,
        setSailAngle,
        setWindDirection,
        setWindSpeed,
        runPhysicsStep,
        resetPhysics
    };
}
