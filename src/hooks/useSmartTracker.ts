'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

import { isPointInWater } from '@/lib/geospatial/water-check';
import { LocationPoint } from '@/lib/geospatial/types';
import {
    SCHOOL_COORDS,
    SCHOOL_RADIUS_METERS,
    BASE_CAR_SPEED_THRESHOLD,
    HIGH_WIND_CAR_THRESHOLD
} from '@/lib/geospatial/constants';
import { getDistance } from '@/lib/geospatial/utils';
import { useWindSpeed } from '@/hooks/useWindSpeed';
import { useNetworkMonitor } from '@/hooks/useNetworkMonitor';

export type { LocationPoint };

/**
 * Smart Tracker Hook
 * Manages geolocation, network status, speed thresholds, and auto-tracking logic.
 */
export function useSmartTracker() {
    const [isTracking, setIsTracking] = useState(false);
    const [isAutoTracking, setIsAutoTracking] = useState(false);
    const [points, setPoints] = useState<LocationPoint[]>([]);
    const [currentPosition, setCurrentPosition] = useState<LocationPoint | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('Reposo');
    const [error, setError] = useState<string | null>(null);
    const [journeyEnded, setJourneyEnded] = useState(false);

    const watchId = useRef<string | null>(null);
    const hasLeftSchool = useRef(false);
    const windSpeed = useWindSpeed();

    // Use refs for values needed in the watch callback to avoid stale closures
    const pointsRef = useRef<LocationPoint[]>([]);
    const currentSpeedThresholdRef = useRef(BASE_CAR_SPEED_THRESHOLD);

    // Sync refs with state/props
    useEffect(() => {
        pointsRef.current = points;
    }, [points]);

    useEffect(() => {
        currentSpeedThresholdRef.current = windSpeed > 18 ? HIGH_WIND_CAR_THRESHOLD : BASE_CAR_SPEED_THRESHOLD;
    }, [windSpeed]);

    /**
     * Stops the current tracking session
     */
    const stopTracking = useCallback((isSuccessEnd = false) => {
        if (watchId.current) {
            Geolocation.clearWatch({ id: watchId.current });
            watchId.current = null;
        }
        setIsTracking(false);
        setIsAutoTracking(false);
        setStatusMessage(prev => {
            if (prev === 'Grabando...') {
                return isSuccessEnd ? 'Completado' : 'Detenido';
            }
            return prev;
        });
    }, []);

    /**
     * Adds a new point to the tracking history if it's significant
     */
    const addPoint = useCallback((point: LocationPoint) => {
        setPoints(prev => {
            const lastPoint = prev[prev.length - 1];
            // Only add if it's the first point or at least 5 seconds have passed
            if (!lastPoint || (point.timestamp - lastPoint.timestamp) > 5000) {
                return [...prev, point];
            }
            return prev;
        });
    }, []);

    // --- SMART LOGIC HELPERS ---

    /**
     * Checks if the current speed exceeds the vehicle threshold
     */
    const checkVehicleSpeed = useCallback((speed: number | null) => {
        if (speed && speed > currentSpeedThresholdRef.current) {
            setStatusMessage('Detección de Vehículo (Coche) - Abortando');
            stopTracking();
            setPoints([]); // Discard tracking
            return true;
        }
        return false;
    }, [stopTracking]);

    /**
     * Checks if the position is within the school geofence
     */
    const checkGeofence = useCallback((latitude: number, longitude: number) => {
        const distToSchool = getDistance(latitude, longitude, SCHOOL_COORDS.lat, SCHOOL_COORDS.lng);

        // Mark as left school if distance > 500m
        if (distToSchool > 500) {
            hasLeftSchool.current = true;
        }

        // Complete journey if returned to school after leaving
        if (hasLeftSchool.current && distToSchool < SCHOOL_RADIUS_METERS) {
            setStatusMessage('Regreso a Escuela - Travesía Completada');
            stopTracking(true);
            setJourneyEnded(true);
            return true;
        }
        return false;
    }, [stopTracking]);

    /**
     * Handles point addition based on sea/land detection and auto-tracking mode
     */
    const handleTrackingPoint = useCallback((point: LocationPoint, isAuto: boolean) => {
        const atSea = isPointInWater(point.lat, point.lng);

        if (isAuto) {
            if (atSea) {
                setStatusMessage('Navegación Detectada');
                addPoint(point);
            } else {
                setStatusMessage('ZONA DE TIERRA - ESCANEANDO');
                // If we were recording and moved far away from sea, stop
                if (pointsRef.current.length > 5 && !hasLeftSchool.current) {
                    setStatusMessage('Regreso a Tierra - Track Finalizado');
                    stopTracking();
                }
            }
        } else {
            // Manual tracking: always add but warn if on land
            if (!atSea) {
                setStatusMessage('⚠️ EN TIERRA');
            } else {
                setStatusMessage('Grabando...');
            }
            addPoint(point);
        }
    }, [addPoint, stopTracking]);

    /**
     * Starts tracking the user's position
     */
    const startTracking = useCallback(async (isAuto = false) => {
        if (watchId.current) return;

        try {
            const { Capacitor } = await import('@capacitor/core');
            if (Capacitor.isNativePlatform()) {
                const permissions = await Geolocation.checkPermissions();
                if (permissions.location !== 'granted') {
                    await Geolocation.requestPermissions();
                }
            }

            setIsTracking(true);
            setIsAutoTracking(isAuto);
            setStatusMessage(isAuto ? 'Auto-Escaneando...' : 'Grabando...');
            setError(null);
            setJourneyEnded(false);
            hasLeftSchool.current = false;

            watchId.current = await Geolocation.watchPosition(
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
                (position, err) => {
                    if (err) {
                        setError(err.message);
                        return;
                    }

                    if (position) {
                        const { latitude, longitude, speed } = position.coords;
                        const newPoint: LocationPoint = {
                            lat: latitude,
                            lng: longitude,
                            timestamp: position.timestamp,
                            speed: speed
                        };

                        setCurrentPosition(newPoint);

                        // --- SMART LOGIC ---
                        if (checkVehicleSpeed(speed)) return;
                        if (checkGeofence(latitude, longitude)) return;
                        handleTrackingPoint(newPoint, isAuto);
                    }
                }
            );
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error tracking');
            setIsTracking(false);
        }
    }, [checkVehicleSpeed, checkGeofence, handleTrackingPoint]);

    // Setup network monitoring
    useNetworkMonitor(useCallback(() => {
        setStatusMessage('WiFi Desconectado - Iniciando Geo-Check');
        startTracking(true); // Start in auto-mode
    }, [startTracking]));

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchId.current) {
                Geolocation.clearWatch({ id: watchId.current });
            }
        };
    }, []);

    return {
        isTracking,
        isAutoTracking,
        points,
        currentPosition,
        statusMessage,
        error,
        journeyEnded,
        startTracking,
        stopTracking,
        clearPoints: () => setPoints([]),
        dismissJourneyEnd: () => setJourneyEnded(false)
    };
}
