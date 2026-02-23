import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollisionSystem } from './CollisionSystem';
import { Vector3 } from 'three';

// Define mock data directly inside vi.mock because vi.mock is hoisted
vi.mock('../../../data/geospatial/water-geometry.json', () => ({
    default: {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [-3.0285, 43.3385],
                        [-3.0085, 43.3385],
                        [-3.0085, 43.3585],
                        [-3.0285, 43.3585],
                        [-3.0285, 43.3385] // Closing point
                    ]]
                }
            }
        ]
    }
}));

describe('CollisionSystem', () => {
    let collisionSystem: CollisionSystem;

    beforeEach(() => {
        vi.resetModules();
        collisionSystem = new CollisionSystem();
    });

    it('should initialize correctly', () => {
        expect(collisionSystem).toBeDefined();
    });

    it('should return true when point is in water (inside polygon)', () => {
        // Center (0,0,0 in simulation) maps to 43.3485, -3.0185
        // This is inside our mock polygon (-3.0285 to -3.0085, 43.3385 to 43.3585)
        const pos = new Vector3(0, 0, 0);
        expect(collisionSystem.checkWaterCollision(pos)).toBe(true);
    });

    it('should return false when point is on land (outside polygon)', () => {
        // Move far away.
        // LNG_SCALE is approx 1/81000 (degrees per meter)
        // We want to move > 0.01 degrees
        // 0.01 * 81000 = 810 meters

        // Let's move 2000 meters East
        const pos = new Vector3(2000, 0, 0);
        expect(collisionSystem.checkWaterCollision(pos)).toBe(false);
    });
});
