import * as turf from '@turf/turf';
import RBush from 'rbush';
import waterGeometryData from '@/data/geospatial/water-geometry.json';

// Define types for our spatial index
interface GeoJSONFeature {
    type: 'Feature';
    geometry: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: any[];
    };
    properties: any;
}

interface SpatialItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    feature: GeoJSONFeature;
}

// Global variable to hold the index in memory
// We use a global variable so the index persists across API calls in a serverless environment (like Vercel)
// as long as the container is warm.
let spatialIndex: RBush<SpatialItem> | null = null;

/**
 * Loads the water polygon data from the GeoJSON file and builds the spatial index.
 * This function should be called once at startup or lazily when needed.
 */
function initializeSpatialIndex() {
    if (spatialIndex) return;

    try {
        const geojson = waterGeometryData as any;

        spatialIndex = new RBush();
        const items: SpatialItem[] = [];

        if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
            geojson.features.forEach((feature: any) => {
                if (!feature.geometry) return;

                try {
                    const bbox = turf.bbox(feature);
                    items.push({
                        minX: bbox[0],
                        minY: bbox[1],
                        maxX: bbox[2],
                        maxY: bbox[3],
                        feature: feature as GeoJSONFeature
                    });
                } catch (e) {
                    console.warn('Failed to process feature for spatial index', e);
                }
            });
        }

        spatialIndex.load(items);
        console.log(`Spatial index initialized with ${items.length} water polygons.`);

    } catch (error) {
        console.error('Error initializing spatial index:', error);
        // Ensure index is not null to prevent repeated failures
        spatialIndex = new RBush();
    }
}

/**
 * Checks if a given coordinate (lat, lng) is inside any water polygon.
 * Uses RBush spatial index for performance.
 *
 * @param lat Latitude
 * @param lng Longitude
 * @returns true if the point is in water, false otherwise (or if on land)
 */
export function isPointInWater(lat: number, lng: number): boolean {
    // Lazy initialization
    if (!spatialIndex) {
        initializeSpatialIndex();
    }

    if (!spatialIndex) return false; // Should not happen due to init logic

    const point = turf.point([lng, lat]);

    // First, find candidate polygons using the bounding box index (fast)
    const candidates = spatialIndex.search({
        minX: lng,
        minY: lat,
        maxX: lng,
        maxY: lat
    });

    if (candidates.length === 0) {
        return false;
    }

    // Iterate through candidates that might contain the point
    return candidates.some((item) => {
        try {
            if (!item.feature) return false;
            return turf.booleanPointInPolygon(point, item.feature);
        } catch (e) {
            return false;
        }
    });
}

/**
 * Simplifies a location check for the sailing simulator or logbook.
 * Returns true if the position is safe for sailing (in water).
 */
export function validateBoatPosition(lat: number, lng: number): {
    inWater: boolean;
    message?: string;
} {
    const inWater = isPointInWater(lat, lng);

    return {
        inWater,
        message: inWater ? undefined : 'Warning: Boat is on land!'
    };
}
