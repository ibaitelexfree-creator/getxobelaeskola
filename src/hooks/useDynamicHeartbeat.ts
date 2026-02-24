'use client';

import { useState, useEffect, useRef } from 'react';
import { LocationPoint } from '@/lib/geospatial/types';
import { useWindSpeed } from '@/hooks/useWindSpeed';

interface HeartbeatResponse {
    success: boolean;
    in_water: boolean;
    server_interval: number;
}

export function useDynamicHeartbeat(isTracking: boolean, currentPosition: LocationPoint | null) {
    const windSpeed = useWindSpeed();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [serverIntervalMs, setServerIntervalMs] = useState(30000); // 30s default
    const currentPositionRef = useRef(currentPosition);

    useEffect(() => {
        currentPositionRef.current = currentPosition;
    }, [currentPosition]);

    const sendHeartbeat = async () => {
        if (!isTracking || !currentPositionRef.current) return;

        try {
            const { lat, lng, speed } = currentPositionRef.current;
            const res = await fetch('/api/tracking/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lat,
                    lng,
                    speed: speed || 0,
                    heading: 0, // Placeholder if heading is not provided by point
                    accuracy: 0
                })
            });

            if (res.ok) {
                const data: HeartbeatResponse = await res.json();
                if (data.server_interval) {
                    let adjustedInterval = data.server_interval;
                    // Apply dynamic logic from wind speed
                    if (windSpeed > 25) { // Knots or m/s? Assuming m/s here or knots but adjusted
                        adjustedInterval = Math.min(adjustedInterval, 8000); // 8s
                    }

                    if (adjustedInterval !== serverIntervalMs) {
                        setServerIntervalMs(adjustedInterval);
                    }
                }
            } else {
                console.error('Heartbeat failed', res.status);
                // Backoff logic could be implemented here
                setServerIntervalMs(prev => Math.min(prev * 1.5, 60000));
            }
        } catch (err: unknown) {
            console.error('Heartbeat error:', err);
            setServerIntervalMs(prev => Math.min(prev * 1.5, 60000));
        }
    };

    useEffect(() => {
        if (isTracking && currentPosition) {
            // Send first heartbeat immediately
            sendHeartbeat();

            // Setup dynamic interval
            intervalRef.current = setInterval(sendHeartbeat, serverIntervalMs);

            // Cleanup
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isTracking, serverIntervalMs, currentPosition !== null]);

    return { serverIntervalMs };
}
