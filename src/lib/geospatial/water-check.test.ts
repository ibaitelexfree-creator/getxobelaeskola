import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted for mock data
const mockFs = vi.hoisted(() => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

vi.mock('fs', () => ({
    default: mockFs,
    ...mockFs
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
                    }
                }
            }
        ];
    });

    it('returns true for a point clearly inside the water polygon (FeatureCollection)', async () => {
        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon (FeatureCollection)', async () => {
        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false for negative coordinates outside the polygon', async () => {
        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(-5, -5)).toBe(false);
    });

    it('returns true for a point on the edge', async () => {
         const { isPointInWater } = await import('./water-check');
         expect(isPointInWater(5, 0)).toBe(true);
    });

    it('handles single Feature fallback', async () => {
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

        const { isPointInWater } = await import('./water-check');

        // Inside
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon', () => {
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false gracefully when geometry data is invalid', async () => {
        // Case: features array exists but contains invalid objects
        // We set features to a non-empty array with invalid content to bypass RBush init checks if any
        // AND ensure turf.booleanPointInPolygon fails.
        // We use explicit corruption that TS allows via 'as any'.
        mockData.data.features = [
            {
                type: 'Feature',
                properties: {},
                geometry: null // Invalid geometry
            }
        ];

        const { isPointInWater } = await import('./water-check');

        // Should return false due to try-catch block in isPointInWater
        expect(isPointInWater(5, 5)).toBe(false);
    });
});
