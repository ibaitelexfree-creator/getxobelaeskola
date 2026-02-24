import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock the data import before importing the function under test
vi.mock('@/data/geospatial/water-geometry.json', () => ({
    default: {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [0, 0],
                            [10, 0],
                            [10, 10],
                            [0, 10],
                            [0, 0]
                        ]
                    ]
                }
            }
        ]
    }
}));

import { isPointInWater } from './water-check';

describe('isPointInWater', () => {
    it('returns true for a point clearly inside the water polygon', () => {
        // Point (5, 5) is inside [0,0] to [10,10]
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon', () => {
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false for negative coordinates outside the polygon', () => {
        expect(isPointInWater(-5, -5)).toBe(false);
    });
});
