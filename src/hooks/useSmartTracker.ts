'use client';

import { useState, useEffect, useRef } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export interface LocationPoint {
    lat: number;
    lng: number;
    timestamp: number;
    speed?: number | null; // Speed in m/s (meters per second)
}

// Configurable constants
const SCHOOL_WIFI_SSID = '5B00';
const BASE_CAR_SPEED_THRESHOLD = 12.86; // ~46 km/h (25 knots)
const HIGH_WIND_CAR_THRESHOLD = 20.57; // ~74 km/h (40 knots) for foiling/high performance
const MARITIME_ZONE = {
    minLat: 43.33, // Avoid residential Getxo/Areeta center
    maxLat: 43.42,
    minLng: -3.15,
    maxLng: -3.001 // Border near the coast
};

export function useSmartTracker() {
    const [isTracking, setIsTracking] = useState(false);
    const [isAutoTracking, setIsAutoTracking] = useState(false);
    const [points, setPoints] = useState<LocationPoint[]>([]);
    const [currentPosition, setCurrentPosition] = useState<LocationPoint | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('Reposo');
    const [error, setError] = useState<string | null>(null);
    const [windSpeed, setWindSpeed] = useState<number>(0);

    const watchId = useRef<string | null>(null);
    const lastNetworkStatus = useRef<ConnectionStatus | null>(null);

    // Dynamic threshold based on wind
    const currentSpeedThreshold = windSpeed > 18 ? HIGH_WIND_CAR_THRESHOLD : BASE_CAR_SPEED_THRESHOLD;

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
        return (
            lat >= MARITIME_ZONE.minLat &&
            lat <= MARITIME_ZONE.maxLat &&
            lng >= MARITIME_ZONE.minLng &&
            lng <= MARITIME_ZONE.maxLng
        );
    };

    // Helper: Convert m/s to knots
    const msToKnots = (ms: number) => (ms * 1.94384);

    const startTracking = async (isAuto = false) => {
        if (watchId.current) return;

        try {
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

                        // 2. Check for Location (Home vs Sea)
                        const atSea = isAtSea(latitude, longitude);

                        if (isAuto) {
                            if (atSea) {
                                setStatusMessage('Navegación Detectada');
                                // Transition from auto-scan to actual recording
                                addPoint(newPoint);
                            } else {
                                setStatusMessage('En Tierra / Rumbo a Casa - Ignorando');
                                // If we were recording and moved far away from sea, stop
                                if (points.length > 5) {
                                    stopTracking();
                                }
                            }
                        } else {
                            // Manual tracking: always add but warn if speed is crazy
                            addPoint(newPoint);
                        }
                    }
                }
            );
        } catch (err: any) {
            setError(err.message || 'Error tracking');
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

    const stopTracking = () => {
        if (watchId.current) {
            Geolocation.clearWatch({ id: watchId.current });
            watchId.current = null;
        }
        setIsTracking(false);
        setIsAutoTracking(false);
        if (statusMessage === 'Grabando...') setStatusMessage('Completado');
    };

    // --- NETWORK & WIFI MONITORING ---
    useEffect(() => {
        const setupNetworkListener = async () => {
            const status = await Network.getStatus();
            lastNetworkStatus.current = status;

            Network.addListener('networkStatusChange', status => {
                console.log('Network status changed', status);

                // Logic: If transitioned from WiFi to anything else (or disconnected)
                // Note: We can't easily get SSID with standard Capacitor Network plugin 
                // but we detect "WiFi Disconnection"
                if (lastNetworkStatus.current?.connectionType === 'wifi' && status.connectionType !== 'wifi') {
                    console.log('WiFi Disconnected - Potential start of sailing');
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
        startTracking,
        stopTracking,
        clearPoints: () => setPoints([])
    };
}
