import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist the mock data container so we can modify it
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
    let isPointInWater: (lat: number, lng: number) => boolean;

    beforeEach(async () => {
        vi.resetModules();
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
        delete mockData.data.geometry;

        const module = await import('./water-check');
        isPointInWater = module.isPointInWater;
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

    it('handles single Feature fallback', async () => {
        vi.resetModules();
        // Modify mock data to look like a single Feature
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

        const module = await import('./water-check');
        isPointInWater = module.isPointInWater;

        // Inside
        expect(isPointInWater(5, 5)).toBe(true);
        // Outside
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false gracefully when geometry data is invalid', async () => {
        vi.resetModules();
        // Case: features array exists but contains invalid objects
        mockData.data.features = [{}];

        const module = await import('./water-check');
        isPointInWater = module.isPointInWater;

        expect(isPointInWater(5, 5)).toBe(false);
    });
});
