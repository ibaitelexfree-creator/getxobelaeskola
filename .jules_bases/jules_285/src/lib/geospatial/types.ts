export interface LocationPoint {
    lat: number;
    lng: number;
    timestamp: number;
    speed?: number | null; // Speed in m/s (meters per second)
}
