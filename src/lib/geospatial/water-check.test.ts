import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isPointInWater, _reloadWaterData_TEST_ONLY } from './water-check';

// Hoist the mock data container
const mockData = vi.hoisted(() => ({
    data: {
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
    } as any
}));

vi.mock('../../data/geospatial/water-geometry.json', () => ({
    default: mockData.data
}));

describe('isPointInWater', () => {
    beforeEach(() => {
        // Reset to default FeatureCollection state
        mockData.data.type = 'FeatureCollection';
        mockData.data.features = [
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
        ];
        if (mockData.data.geometry) delete mockData.data.geometry;

        // Reload the R-tree with the reset mock data
        if (_reloadWaterData_TEST_ONLY) {
            _reloadWaterData_TEST_ONLY();
        }
    });

    it('returns true for a point clearly inside the water polygon (FeatureCollection)', () => {
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon (FeatureCollection)', () => {
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false for negative coordinates outside the polygon', () => {
        expect(isPointInWater(-5, -5)).toBe(false);
    });

    it('returns true for a point on the edge', () => {
         expect(isPointInWater(5, 0)).toBe(true);
    });

    it('handles single Feature fallback', () => {
        delete mockData.data.features;
        mockData.data.type = 'Feature';
        mockData.data.geometry = {
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
        };

        // Reload with single feature data
        if (_reloadWaterData_TEST_ONLY) _reloadWaterData_TEST_ONLY();

        expect(isPointInWater(5, 5)).toBe(true);
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false gracefully when geometry data is invalid', () => {
        mockData.data.features = [{}];

        // Reload with invalid data
        if (_reloadWaterData_TEST_ONLY) _reloadWaterData_TEST_ONLY();

        expect(isPointInWater(5, 5)).toBe(false);
    });
});
