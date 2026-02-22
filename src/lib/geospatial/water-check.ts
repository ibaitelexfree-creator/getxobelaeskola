import * as turf from "@turf/turf";
import waterGeometryData from "../../data/geospatial/water-geometry.json";

// Simple check if a point (lat, lng) is within the water polygons
export function isPointInWater(lat: number, lng: number): boolean {
	const point = turf.point([lng, lat]);

	// The JSON is a FeatureCollection of Polygons
	const featureCollection = waterGeometryData as any;

	// Turf can handle FeatureCollection in booleanPointInPolygon if we iterate or if the library supports it directly
	// Actually booleanPointInPolygon takes a Polygon, MultiPolygon or Feature
	// We should check against each feature in the collection

	if (featureCollection.features) {
		return featureCollection.features.some((feature: any) => {
			try {
				return turf.booleanPointInPolygon(point, feature);
			} catch (e) {
				return false;
			}
		});
	}

	// Fallback if it's a single feature
	try {
		return turf.booleanPointInPolygon(point, featureCollection);
	} catch (e) {
		return false;
	}
}

/**
 * Simplifies a location check for the sailing simulator or logbook.
 * Returns true if the position is safe for sailing (in water).
 */
export function validateBoatPosition(
	lat: number,
	lng: number,
): {
	inWater: boolean;
	message?: string;
} {
	const inWater = isPointInWater(lat, lng);

	return {
		inWater,
		message: inWater ? undefined : "Warning: Boat is on land!",
	};
}
