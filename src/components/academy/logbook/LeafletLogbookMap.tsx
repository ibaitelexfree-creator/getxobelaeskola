'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NavigationPoint } from '@/types/navigation';

interface LeafletLogbookMapProps {
    sessions: NavigationPoint[];
    selectedPoint: NavigationPoint | null;
    setSelectedPoint: (p: NavigationPoint | null) => void;
    activePoints?: { lat: number, lng: number }[];
    isTracking?: boolean;
}

export default function LeafletLogbookMap({
    sessions,
    selectedPoint,
    setSelectedPoint,
    activePoints = [],
    isTracking = false
}: LeafletLogbookMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);
    const tracksRef = useRef<L.LayerGroup | null>(null);
    const activeTrackRef = useRef<L.Polyline | null>(null);
    const activeMarkerRef = useRef<L.CircleMarker | null>(null);

    // Initial map setup
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Create map instance
        const map = L.map(containerRef.current, {
            center: [43.35, -3.01],
            zoom: 13,
            zoomControl: false,
            attributionControl: false
        });

        // Add Dark Mode tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        // Create groups for organization
        const markers = L.layerGroup().addTo(map);
        const tracks = L.layerGroup().addTo(map);

        mapRef.current = map;
        markersRef.current = markers;
        tracksRef.current = tracks;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update real-time active track
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove old active track
        if (activeTrackRef.current) {
            activeTrackRef.current.remove();
            activeTrackRef.current = null;
        }
        if (activeMarkerRef.current) {
            activeMarkerRef.current.remove();
            activeMarkerRef.current = null;
        }

        if (isTracking && activePoints.length > 0) {
            const positions = activePoints.map(p => [p.lat, p.lng] as L.LatLngExpression);

            // Draw polyline
            activeTrackRef.current = L.polyline(positions, {
                color: '#22c55e', // Green for active recording
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10',
                className: 'animate-pulse'
            }).addTo(map);

            // Draw marker at current position
            const lastPoint = activePoints[activePoints.length - 1];
            activeMarkerRef.current = L.circleMarker([lastPoint.lat, lastPoint.lng], {
                radius: 6,
                fillColor: '#22c55e',
                color: 'white',
                weight: 2,
                fillOpacity: 1
            }).addTo(map);

            // Center map on last point if tracking
            if (activePoints.length === 1 || (activePoints.length % 5 === 0)) {
                map.panTo([lastPoint.lat, lastPoint.lng]);
            }
        }
    }, [activePoints, isTracking]);

    // Update data (markers and tracks)
    useEffect(() => {
        const map = mapRef.current;
        const markersGroup = markersRef.current;
        const tracksGroup = tracksRef.current;

        if (!map || !markersGroup || !tracksGroup) return;

        // Clear existing
        markersGroup.clearLayers();
        tracksGroup.clearLayers();

        // Process sessions
        if (Array.isArray(sessions)) {
            sessions.forEach(session => {
                // 1. Draw Track
                if (session.track_log && Array.isArray(session.track_log) && session.track_log.length >= 2) {
                    const positions = session.track_log
                        .map(p => {
                            const lat = typeof p.lat === 'string' ? parseFloat(p.lat) : p.lat;
                            const lng = typeof p.lng === 'string' ? parseFloat(p.lng) : p.lng;
                            return (isNaN(lat) || isNaN(lng)) ? null : [lat, lng] as L.LatLngExpression;
                        })
                        .filter((p): p is L.LatLngExpression => p !== null);

                    if (positions.length >= 2) {
                        const isSelected = selectedPoint?.id === session.id;
                        L.polyline(positions, {
                            color: isSelected ? "#fbbf24" : "#0ea5e9",
                            weight: isSelected ? 4 : 2,
                            opacity: isSelected ? 1 : 0.6
                        })
                            .on('click', () => setSelectedPoint(session))
                            .addTo(tracksGroup);
                    }
                }

                // 2. Draw Main Marker
                if (session.ubicacion) {
                    const lat = typeof session.ubicacion.lat === 'string' ? parseFloat(session.ubicacion.lat) : session.ubicacion.lat;
                    const lng = typeof session.ubicacion.lng === 'string' ? parseFloat(session.ubicacion.lng) : session.ubicacion.lng;

                    if (!isNaN(lat) && !isNaN(lng)) {
                        const isSelected = selectedPoint?.id === session.id;
                        L.circleMarker([lat, lng], {
                            radius: isSelected ? 8 : 5,
                            fillColor: isSelected ? '#fbbf24' : '#0ea5e9',
                            color: 'white',
                            weight: 1,
                            fillOpacity: 0.8
                        })
                            .bindPopup(`<div style="color: black; font-weight: bold; font-family: sans-serif; font-size: 10px; text-transform: uppercase;">${session.zona_nombre || session.tipo}</div>`)
                            .on('click', () => setSelectedPoint(session))
                            .addTo(markersGroup);
                    }
                }
            });
        }
    }, [sessions, selectedPoint, setSelectedPoint]);


    return (
        <div className="w-full h-full relative" style={{ minHeight: '400px', background: '#050b14' }}>
            <div
                ref={containerRef}
                style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
            />
        </div>
    );
}
