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
    beforeEach(() => {
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
        // Ensure geometry property is removed if it was added
        if (mockData.data.geometry) {
             delete mockData.data.geometry;
        }
    });

    async function getIsPointInWater() {
        const { isPointInWater } = await import('./water-check');
        return isPointInWater;
    }

    it('returns true for a point clearly inside the water polygon (FeatureCollection)', async () => {
        const isPointInWater = await getIsPointInWater();
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon (FeatureCollection)', async () => {
        const isPointInWater = await getIsPointInWater();
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false for negative coordinates outside the polygon', async () => {
        const isPointInWater = await getIsPointInWater();
        expect(isPointInWater(-5, -5)).toBe(false);
    });

    it('returns true for a point on the edge', async () => {
         const isPointInWater = await getIsPointInWater();
         expect(isPointInWater(5, 0)).toBe(true);
    });

    it('handles single Feature fallback', async () => {
        // Modify mock data to look like a single Feature
        // Remove 'features' array
        delete mockData.data.features;

        // Add geometry directly
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

        const isPointInWater = await getIsPointInWater();

        // Inside
        expect(isPointInWater(5, 5)).toBe(true);
        // Outside
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false gracefully when geometry data is invalid', async () => {
        // Case: features array exists but contains invalid objects
        mockData.data.features = [{}];
        const isPointInWater = await getIsPointInWater();
        expect(isPointInWater(5, 5)).toBe(false);
    });
});
