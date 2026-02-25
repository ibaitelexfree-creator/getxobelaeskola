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
    const items: WaterPolygonItem[] = [];
    featureCollection.features.forEach((feature: any) => {
        try {
             // Validate geometry before adding
            if (!feature || !feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
                return;
            }
            const bbox = turf.bbox(feature);
            items.push({
                minX: bbox[0],
                minY: bbox[1],
                maxX: bbox[2],
                maxY: bbox[3],
                feature: feature
            });
        } catch (e) {
            // Ignore invalid features
        }
    });
    // ONLY load if there are items. R-tree doesn't clear previous data automatically if you push nothing.
    // However, this script runs once at module load.
    if (items.length > 0) {
        tree.load(items);
    }
} else {
    // Fallback if it's a single feature
    try {
        if (featureCollection.geometry && featureCollection.geometry.coordinates && featureCollection.geometry.coordinates.length > 0) {
            const bbox = turf.bbox(featureCollection);
            tree.load([{
                minX: bbox[0],
                minY: bbox[1],
                maxX: bbox[2],
                maxY: bbox[3],
                feature: featureCollection
            }]);
        }
    } catch (e) {
        // Ignore invalid geometry
    }
}

// Simple check if a point (lat, lng) is within the water polygons
export function isPointInWater(lat: number, lng: number): boolean {
    // Basic validation
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return false;
    }

    // The test case "invalid geometry" might be expecting false if the internal data structure is corrupt.
    // However, this module loads data once at startup. The test modifies the mock data *after* load?
    // If the test modifies `mockData.data` which is exported as default from the JSON,
    // and this module imports it...
    // The test actually mocks the import:
    /*
    vi.mock('../../data/geospatial/water-geometry.json', () => ({
        default: mockData.data
    }));
    */
    // This implies that every time `isPointInWater` runs, it shouldn't re-read the json, because it's at top level.
    // BUT, the test modifies the mock data *before* each test?
    // Wait, the module code runs *once*.
    // If the test modifies the mock data *after* the module has initialized, the `tree` is already built with the OLD data (or empty if it ran before data was added).
    // Actually, `vi.mock` is hoisted.
    // The `tree` construction happens at module scope.
    // If the test suite runs multiple tests, the module state persists.
    // This is problematic for testing different data scenarios if the logic is top-level.

    // To make this testable dynamically, we should probably check if `tree` is empty or if we should reload it,
    // OR we move the tree logic into a function (lazy loading) or export a way to reload it.
    // Or, for the specific test failure: "returns false gracefully when geometry data is invalid"
    // The test sets `features = [{}]`.
    // If the module has already loaded valid data from a previous test, `tree` is full.
    // `isPointInWater(5,5)` hits the tree.
    // The test fails because it expects false, but gets true (from previous test data?).

    // Actually, in the test provided earlier:
    /*
    beforeEach(() => {
        // Reset to default FeatureCollection state...
    });
    */
    // This resets the MOCK object. But the `water-check.ts` module has *already read* that object and built the `tree`.
    // The `tree` variable inside `water-check.ts` does NOT update when the mock object changes, because it was built once.

    // Fix: We need to allow reloading or make the tree building dynamic/lazy.
    // Given this is a quick fix, let's make the tree lazy-loaded or rebuild if empty/detected change?
    // Detecting change is hard.
    // Better: export a function to reset/reload for testing purposes?
    // Or just check if the candidates are actually valid *at query time* if they point to the raw objects?
    // The R-tree stores `items`. `items` contain `feature`. `feature` is a reference to the object in the mock data array?
    // If the test replaces the array `features = [{}]`, the R-tree still holds references to the OLD objects (the ones that were in the array before it was replaced).
    // So `isPointInWater` is checking against the old valid polygons.

    // To fix this without major refactoring:
    // We can export `loadWaterData` and call it. But that changes the public API.
    // Or we can construct the R-Tree on every call (slow?).
    // Or we can accept that this specific unit test pattern (modifying module-level mock data after module load) is flawed for this implementation.

    // HOWEVER, the requirement is to fix the CI.
    // The most robust way for the application is to keep the static index for performance.
    // The test is simulating "what if the JSON is bad".
    // If we want to support the test, we must allow re-initialization.

    // Let's modify the code to check validity at runtime slightly better, OR just ignore that test case if it's unrealistic (the JSON is static in prod).
    // But modifying the code to be safer is better.

    const point = turf.point([lng, lat]);

    // Perform the search
    let candidates: WaterPolygonItem[] = [];
    try {
        candidates = tree.search({
            minX: lng,
            minY: lat,
            maxX: lng,
            maxY: lat
        });
    } catch (e) {
        return false;
    }

    if (candidates.length === 0) return false;

    // Double check that the candidate features are still valid (in case they were modified in memory?)
    // This doesn't solve the "replaced array" issue though.

    return candidates.some((item) => {
        try {
            // Extra safety: check if geometry exists on the item's feature
            if (!item.feature || !item.feature.geometry) return false;
            return turf.booleanPointInPolygon(point, item.feature);
        } catch (e) {
            return false;
        }
    });
}

// Export a way to reload data for testing (internal use / testing only)
export function _reloadWaterData_TEST_ONLY() {
    tree.clear();
    const collection = waterGeometryData as any;
    if (collection.features) {
         const items: WaterPolygonItem[] = [];
        collection.features.forEach((feature: any) => {
            try {
                if (!feature || !feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length === 0) return;
                const bbox = turf.bbox(feature);
                items.push({ minX: bbox[0], minY: bbox[1], maxX: bbox[2], maxY: bbox[3], feature });
            } catch(e) {}
        });
        if(items.length > 0) tree.load(items);
    } else {
        try {
             if (collection.geometry && collection.geometry.coordinates && collection.geometry.coordinates.length > 0) {
                const bbox = turf.bbox(collection);
                tree.load([{ minX: bbox[0], minY: bbox[1], maxX: bbox[2], maxY: bbox[3], feature: collection }]);
             }
        } catch(e) {}
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
