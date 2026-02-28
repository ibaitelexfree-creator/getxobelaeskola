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

vi.mock('@/data/geospatial/water-geometry.json', () => ({
    default: mockData.data
}));

describe('isPointInWater', () => {
    beforeEach(async () => {
        vi.resetModules();
        const { _resetSpatialIndex } = await import('./water-check');
        _resetSpatialIndex();

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
        const mod = await import('./water-check');
        // Force reload of internal state if the export exists (for test isolation)
        if ((mod as any)._reloadWaterData_TEST_ONLY) {
            (mod as any)._reloadWaterData_TEST_ONLY();
        }
        return mod.isPointInWater;
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
        // Explicitly clear geometry AND features to ensure clean state
        delete mockData.data.geometry;
        mockData.data.type = 'FeatureCollection';
        // Case: features array exists but contains invalid objects
        mockData.data.features = [{}];

        const isPointInWater = await getIsPointInWater();
        // isPointInWater likely validates structure before checking, or defaults safely.
        // If it throws or returns true incorrectly, we need to fix the implementation.
        // Assuming implementation handles it by filtering valid features:
        expect(isPointInWater(5, 5)).toBe(false);
    });
});
