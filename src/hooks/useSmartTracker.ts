'use client';

import { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Network, ConnectionStatus } from '@capacitor/network';
// import { Capacitor } from '@capacitor/core';

import { isPointInWater } from '@/lib/geospatial/water-check';

export interface LocationPoint {
    lat: number;
    lng: number;
    timestamp: number;
    speed?: number | null; // Speed in m/s (meters per second)
}

// Configurable constants
const BASE_CAR_SPEED_THRESHOLD = 12.86; // ~46 km/h (25 knots)
const HIGH_WIND_CAR_THRESHOLD = 20.57; // ~74 km/h (40 knots) for foiling/high performance

const SCHOOL_COORDS = { lat: 43.3424, lng: -3.0135 };
const SCHOOL_RADIUS_METERS = 150; // Geofence radius

export function useSmartTracker() {
    const [isTracking, setIsTracking] = useState(false);
    const [isAutoTracking, setIsAutoTracking] = useState(false);
    const [points, setPoints] = useState<LocationPoint[]>([]);
    const [currentPosition, setCurrentPosition] = useState<LocationPoint | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('Reposo');
    const [error, setError] = useState<string | null>(null);
    const [windSpeed, setWindSpeed] = useState<number>(0);
    const [journeyEnded, setJourneyEnded] = useState(false); // New state to trigger logbook prompt

    const watchId = useRef<string | null>(null);
    const lastNetworkStatus = useRef<ConnectionStatus | null>(null);
    const hasLeftSchool = useRef(false);

    // Dynamic threshold based on wind
    const currentSpeedThreshold = windSpeed > 18 ? HIGH_WIND_CAR_THRESHOLD : BASE_CAR_SPEED_THRESHOLD;

    // Helper: Haversine distance
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    };

    // Fetch weather to adjust threshold
    useEffect(() => {
        const fetchWind = async () => {
            try {
                const res = await fetch('/api/weather');
                const data = await res.json();
                if (data.windSpeed) setWindSpeed(data.windSpeed);
            } catch (e) {
                console.error('Weather fetch error in tracker', e);
            }
        };
        fetchWind();
        const interval = setInterval(fetchWind, 600000); // 10 mins
        return () => clearInterval(interval);
    }, []);

    // Helper: Check if coordinates are in the sea
    const isAtSea = (lat: number, lng: number) => {
        return isPointInWater(lat, lng);
    };

    const startTracking = async (isAuto = false) => {
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

                        // 1. Check for Car Speed
                        if (speed && speed > currentSpeedThreshold) {
                            setStatusMessage('Detección de Vehículo (Coche) - Abortando');
                            stopTracking();
                            setPoints([]); // Discard tracking
                            return;
                        }

                        // 2. Check for Geofence
                        const distToSchool = getDistance(latitude, longitude, SCHOOL_COORDS.lat, SCHOOL_COORDS.lng);
                        if (distToSchool > 500) {
                            hasLeftSchool.current = true;
                        }

                        if (hasLeftSchool.current && distToSchool < SCHOOL_RADIUS_METERS) {
                            setStatusMessage('Regreso a Escuela - Travesía Completada');
                            stopTracking(true); // Stop but passing 'completed' hint
                            setJourneyEnded(true);
                            return;
                        }

                        // 3. Check for Location (Home vs Sea)
                        const atSea = isAtSea(latitude, longitude);

                        if (isAuto) {
                            if (atSea) {
                                setStatusMessage('Navegación Detectada');
                                // Transition from auto-scan to actual recording
                                addPoint(newPoint);
                            } else {
                                setStatusMessage('ZONA DE TIERRA - ESCANEANDO');
                                // If we were recording and moved far away from sea, stop
                                if (points.length > 5 && !hasLeftSchool.current) {
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
                            addPoint(newPoint);
                        }
                    }
                }
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error tracking';
            setError(errorMessage);
            setIsTracking(false);
        }
    };

    const addPoint = (point: LocationPoint) => {
        setPoints(prev => {
            const lastPoint = prev[prev.length - 1];
            if (!lastPoint || (point.timestamp - lastPoint.timestamp) > 5000) {
                return [...prev, point];
            }
            return prev;
        });
    };

    const stopTracking = (isSuccessEnd = false) => {
        if (watchId.current) {
            Geolocation.clearWatch({ id: watchId.current });
            watchId.current = null;
        }
        setIsTracking(false);
        setIsAutoTracking(false);
        if (statusMessage === 'Grabando...') setStatusMessage(isSuccessEnd ? 'Completado' : 'Detenido');
    };

    // --- NETWORK & WIFI MONITORING ---
    useEffect(() => {
        const setupNetworkListener = async () => {
            const status = await Network.getStatus();
            lastNetworkStatus.current = status;

            Network.addListener('networkStatusChange', status => {
                // Logic: If transitioned from WiFi to anything else (or disconnected)
                // Note: We can't easily get SSID with standard Capacitor Network plugin 
                // but we detect "WiFi Disconnection"
                if (lastNetworkStatus.current?.connectionType === 'wifi' && status.connectionType !== 'wifi') {
                    setStatusMessage('WiFi Desconectado - Iniciando Geo-Check');
                    startTracking(true); // Start in auto-mode
                }

                lastNetworkStatus.current = status;
            });
        };

        setupNetworkListener();

        return () => {
            Network.removeAllListeners();
            if (watchId.current) Geolocation.clearWatch({ id: watchId.current });
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
