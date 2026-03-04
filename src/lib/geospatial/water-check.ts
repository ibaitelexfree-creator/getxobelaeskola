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
let spatialIndex: any | null = null; // Use any to bypass strict type check for now, RBush<SpatialItem>

export function _resetSpatialIndex() {
    spatialIndex = null;
}

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

        // Support for FeatureCollection
        if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
            geojson.features.forEach((feature: any) => {
                // Skip invalid features immediately
                if (!feature || typeof feature !== 'object' || !feature.geometry || !feature.geometry.coordinates) return;

                try {
                    const bbox = turf.bbox(feature);
                    // Ensure bbox is valid numbers and has 4 or 6 elements (2D or 3D)
                    if (!bbox || (bbox.length !== 4 && bbox.length !== 6) || bbox.some(coord => typeof coord !== 'number' || isNaN(coord))) return;

                    const maxX = bbox.length === 6 ? bbox[3] : bbox[2];
                    const maxY = bbox.length === 6 ? bbox[4] : bbox[3];

                    items.push({
                        minX: bbox[0],
                        minY: bbox[1],
                        maxX: maxX,
                        maxY: maxY,
                        feature: feature as GeoJSONFeature
                    });
                } catch (e) {
                    console.log('Failed to process feature for spatial index', e);
                }
            });
        }
        // Support for single Feature fallback (Jules' fix)
        // This fallback handles cases where the geometry data is provided as a single GeoJSON Feature
        // rather than a FeatureCollection. It ensures that the spatial index still gets populated correctly
        // by generating a bounding box for the single polygon/multipolygon.
        else if (geojson.type === 'Feature' && geojson.geometry && geojson.geometry.coordinates) {
            try {
                const bbox = turf.bbox(geojson);
                if (bbox && (bbox.length === 4 || bbox.length === 6) && !bbox.some(coord => typeof coord !== 'number' || isNaN(coord))) {
                    const maxX = bbox.length === 6 ? bbox[3] : bbox[2];
                    const maxY = bbox.length === 6 ? bbox[4] : bbox[3];

                    items.push({
                        minX: bbox[0],
                        minY: bbox[1],
                        maxX: maxX,
                        maxY: maxY,
                        feature: geojson as GeoJSONFeature
                    });
                }
            } catch (e) {
                console.log('Failed to process single feature for spatial index', e);
            }
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
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return false;

    // Lazy initialization
    if (!spatialIndex) {
        initializeSpatialIndex();
    }

    // Safety check: if index still null or empty
    if (!spatialIndex || spatialIndex.all().length === 0) return false;

    try {
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
        return candidates.some((item: any) => {
            try {
                if (!item || !item.feature || !item.feature.geometry || !item.feature.geometry.coordinates) return false;
                return turf.booleanPointInPolygon(point, item.feature);
            } catch (e) {
                return false;
            }
        });
    } catch (e) {
        return false;
    }
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
