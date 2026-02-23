import { describe, it, expect } from 'vitest';
import { BoatPhysics } from './BoatPhysics';
import { Vector3 } from 'three';

describe('BoatPhysics', () => {
    it('should heel away from the wind (Leeward)', () => {
        const physics = new BoatPhysics();

        // Simulate Wind from Port (-90 degrees relative to bow)
        // Wind coming from Left (-X), blowing to Right (+X).
        // Boat Heading 0.
        // angleToBoat: -PI/2 (-90 deg)
        const apparentWind = {
            vector: new Vector3(10, 0, 0),
            speed: 10,
            angleToBoat: -Math.PI / 2
        };

        // Sail at Starboard (+45 degrees)
        // Sail angle is relative to boat centerline.
        const sailAngle = Math.PI / 4;

        // Rudder centered
        const rudderAngle = 0;

        // Small time step
        const dt = 0.1;

        // Run update for a few steps to let physics stabilize slightly (damping involved)
        for (let i = 0; i < 10; i++) {
            physics.update(dt, apparentWind, sailAngle, rudderAngle);
        }

        // Expect Heel to be Positive (Starboard)
        // Currently implementation produces Negative (Port) which is "Into the wind".
        // We want "Away from wind" -> Starboard -> Positive.
        expect(physics.state.heel).toBeGreaterThan(0);
    });
});
