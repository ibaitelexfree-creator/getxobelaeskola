import * as turf from '@turf/turf';
import waterGeometryData from '../../data/geospatial/water-geometry.json';
import RBush from 'rbush';

// Define the item type for the R-tree
interface WaterPolygonItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    feature: any; // The geojson feature
}

// Initialize the R-tree index
const tree = new RBush<WaterPolygonItem>();
const featureCollection = waterGeometryData as any;

// Populate the index once
if (featureCollection.features) {
    const items: WaterPolygonItem[] = featureCollection.features.map((feature: any) => {
        const bbox = turf.bbox(feature);
        return {
            minX: bbox[0],
            minY: bbox[1],
            maxX: bbox[2],
            maxY: bbox[3],
            feature: feature
        };
    });
    tree.load(items);
} else {
    // Fallback if it's a single feature
    const bbox = turf.bbox(featureCollection);
    tree.load([{
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        feature: featureCollection
    }]);
}

// Simple check if a point (lat, lng) is within the water polygons
export function isPointInWater(lat: number, lng: number): boolean {
    const point = turf.point([lng, lat]);

    // Query the R-tree for candidates
    // The search box is just the point itself
    const candidates = tree.search({
        minX: lng,
        minY: lat,
        maxX: lng,
        maxY: lat
    });

    // Only iterate through candidates that might contain the point
    return candidates.some((item) => {
        try {
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
