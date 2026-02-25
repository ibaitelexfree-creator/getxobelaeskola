import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('isPointInWater', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('returns true for a point clearly inside the water polygon (FeatureCollection)', async () => {
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]
                    },
                    properties: {}
                }]
            }
        }));

        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(5, 5)).toBe(true);
    });

    it('returns false for a point clearly outside the water polygon (FeatureCollection)', async () => {
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]
                    },
                    properties: {}
                }]
            }
        }));

        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(15, 15)).toBe(false);
    });

    it('returns false gracefully when geometry data is invalid', async () => {
        // Mock with invalid feature that would normally crash bbox or cause issues
        vi.doMock('../../data/geospatial/water-geometry.json', () => ({
            default: {
                type: 'FeatureCollection',
                features: [{}] // Invalid feature
            }
        }));

        const { isPointInWater } = await import('./water-check');
        expect(isPointInWater(5, 5)).toBe(false);
    });
});
