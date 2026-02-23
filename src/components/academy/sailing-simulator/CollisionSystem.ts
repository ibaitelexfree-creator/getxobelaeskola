import RBush from 'rbush';
import * as turf from '@turf/turf';
import { Vector3 } from 'three';
import waterGeometryData from '../../../data/geospatial/water-geometry.json';

// Mapping constants matching the simulator
// REAL_WORLD_CENTER = { lat: 43.3485, lng: -3.0185 }; // Getxo Port area
// LAT_SCALE = 1 / 111320; // 1 meter approx
// LNG_SCALE = 1 / 81000;  // 1 meter approx at 43 deg lat
const REAL_WORLD_CENTER = { lat: 43.3485, lng: -3.0185 };
const LAT_SCALE = 1 / 111320;
const LNG_SCALE = 1 / 81000;

interface WaterPolygon {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    feature: any; // GeoJSON Feature
}

export class CollisionSystem {
    private tree: RBush<WaterPolygon>;
    private initialized = false;

    constructor() {
        this.tree = new RBush<WaterPolygon>();
        this.init();
    }

    private init() {
        const collection = waterGeometryData as any;
        if (!collection.features) return;

        const items: WaterPolygon[] = [];

        collection.features.forEach((feature: any) => {
            const bbox = turf.bbox(feature);
            // bbox is [minX, minY, maxX, maxY] (lng, lat)
            items.push({
                minX: bbox[0],
                minY: bbox[1],
                maxX: bbox[2],
                maxY: bbox[3],
                feature: feature
            });
        });

        this.tree.load(items);
        this.initialized = true;
    }

    public checkWaterCollision(pos: Vector3): boolean {
        if (!this.initialized) return true; // Fail safe

        const lat = REAL_WORLD_CENTER.lat - (pos.z * LAT_SCALE);
        const lng = REAL_WORLD_CENTER.lng + (pos.x * LNG_SCALE);
        const point = turf.point([lng, lat]);

        // Query the tree for candidates
        // Point is [lng, lat] (x, y)
        // search takes a bbox
        const candidates = this.tree.search({
            minX: lng,
            minY: lat,
            maxX: lng,
            maxY: lat
        });

        // If no bounding box contains the point, it's definitely not in any water polygon
        // So it is on land.
        if (candidates.length === 0) {
            return false;
        }

        // Check exact collision with candidates
        return candidates.some(item => turf.booleanPointInPolygon(point, item.feature));
    }
}
