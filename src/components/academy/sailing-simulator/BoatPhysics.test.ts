import { describe, it, expect } from 'vitest';
import { BoatPhysics } from './BoatPhysics';
import { Vector3 } from 'three';

describe('BoatPhysics', () => {
    it('should initialize state correctly', () => {
        const physics = new BoatPhysics();
        expect(physics.state).toBeDefined();
        expect(physics.state.position).toBeInstanceOf(Vector3);
        expect(physics.state.velocity).toBeInstanceOf(Vector3);
    });

    it('should update state without errors', () => {
        const physics = new BoatPhysics();

        // Mock ApparentWind
        const mockApparentWind = {
            vector: new Vector3(10, 0, 0),
            speed: 10,
            angleToBoat: Math.PI / 4 // 45 degrees
        };

        // Update loop
        physics.update(0.1, mockApparentWind, Math.PI / 8, 0);

        // Check essential state properties
        expect(physics.state.position).toBeInstanceOf(Vector3);
        expect(physics.state.velocity).toBeInstanceOf(Vector3);
        expect(physics.state.heading).toBeDefined();
        expect(physics.state.speed).toBeGreaterThan(0); // Should move with wind
    });

    it('should not contain debug properties (liftCoeff, aoa)', () => {
        const physics = new BoatPhysics();
        const state = physics.state as any;

        expect(state.liftCoeff).toBeUndefined();
        expect(state.aoa).toBeUndefined();

        const keys = Object.keys(physics.state);
        expect(keys).not.toContain('liftCoeff');
        expect(keys).not.toContain('aoa');
    });
});
