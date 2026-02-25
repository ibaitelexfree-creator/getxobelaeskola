import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('isPointInWater', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    const validFeatureCollection = {
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

    it('returns true for a point clearly inside the water polygon (FeatureCollection)', async () => {
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: validFeatureCollection
        }));
        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon (FeatureCollection)', async () => {
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: validFeatureCollection
        }));
        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false for negative coordinates outside the polygon', async () => {
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: validFeatureCollection
        }));
        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(-5, -5)).toBe(false);
    });

    it('returns true for a point on the edge', async () => {
         vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: validFeatureCollection
        }));
         const { isPointInWater } = await import('./water-check');
         expect(isPointInWater(5, 0)).toBe(true);
    });

    it('handles single Feature fallback', async () => {
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: {
                type: 'Feature',
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
        }));

        const { isPointInWater } = await import('./water-check');

        // Inside
        expect(isPointInWater(5, 5)).toBe(true);
        // Outside
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false gracefully when geometry data is invalid', async () => {
        // Case: features array exists but contains invalid objects
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: {
                type: 'FeatureCollection',
                features: [{}]
            }
        }));

        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(5, 5)).toBe(false);
    });
});
