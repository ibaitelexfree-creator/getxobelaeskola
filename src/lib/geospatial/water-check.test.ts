import { describe, it, expect, vi, afterEach } from 'vitest';
import { isPointInWater } from './water-check';

// We need a mutable mock
const mockFeatures: any[] = [
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]
        },
        properties: {}
    }
];

vi.mock('../../data/geospatial/water-geometry.json', () => ({
    default: {
        type: 'FeatureCollection',
        get features() { return mockFeatures; }
    }
}));

describe('isPointInWater', () => {
    afterEach(() => {
        // Reset mockFeatures
        mockFeatures.length = 0;
        mockFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]
            },
            properties: {}
        });
    });

    it('returns true for a point clearly inside the water polygon', () => {
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false gracefully when geometry data is invalid', () => {
        mockFeatures[0] = {};
        expect(isPointInWater(5, 5)).toBe(false);
    });
});
