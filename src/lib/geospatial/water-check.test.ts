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
    let isPointInWater: any;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();

        // Setup default mock data
        const mockGeoJSON = {
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
        };

        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(JSON.stringify(mockGeoJSON));

        // Re-import the module to trigger initialization with new mock data
        const module = await import('./water-check');
        isPointInWater = module.isPointInWater;
    });

    it('returns true for a point clearly inside the water polygon', () => {
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon', () => {
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false for negative coordinates outside the polygon', () => {
        expect(isPointInWater(-5, -5)).toBe(false);
    });

    it('returns true for a point on the edge', () => {
         expect(isPointInWater(5, 0)).toBe(true);
    });

    it('returns false gracefully when geometry data is invalid', async () => {
        vi.resetModules();
        mockFs.readFileSync.mockReturnValue(JSON.stringify({
            type: 'FeatureCollection',
            features: [{ properties: {} }] // Missing geometry
        }));

        const module = await import('./water-check');
        expect(module.isPointInWater(5, 5)).toBe(false);
    });

    it('returns false if file does not exist', async () => {
        vi.resetModules();
        mockFs.existsSync.mockReturnValue(false);

        const module = await import('./water-check');
        expect(module.isPointInWater(5, 5)).toBe(false);
    });
});
