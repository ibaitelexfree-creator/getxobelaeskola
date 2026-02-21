'use client';

import React, { useEffect, useRef } from 'react';
import { RegattaStep } from '@/lib/data/historical-regattas';
import 'leaflet/dist/leaflet.css';

interface RegattaMapProps {
    steps: RegattaStep[];
    currentStepIndex: number;
}

export default function RegattaMap({ steps, currentStepIndex }: RegattaMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const LRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polylinesRef = useRef<any[]>([]);
    const initializing = useRef(false);

    // Initialize Map
    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current || mapInstance.current || initializing.current) return;

        const initMap = async () => {
            if (!mapRef.current || initializing.current) return;
            initializing.current = true;

            const L = (await import('leaflet')).default;
            LRef.current = L;

            // Fix default icon issue
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            });

            // Dark Matter tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);

            mapInstance.current = map;
        };

        initMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update Route and Position
    useEffect(() => {
        const map = mapInstance.current;
        const L = LRef.current;

        if (!map || !L || !steps || steps.length === 0) return;

        // Clear previous layers
        markersRef.current.forEach(m => map.removeLayer(m));
        polylinesRef.current.forEach(p => map.removeLayer(p));
        markersRef.current = [];
        polylinesRef.current = [];

        // 1. Draw Full Route (Dimmed)
        const allPositions = steps.map(s => s.coordinates);
        const fullRoute = L.polyline(allPositions, {
            color: '#334155', // slate-700
            weight: 2,
            dashArray: '5, 10',
            opacity: 0.5
        }).addTo(map);
        polylinesRef.current.push(fullRoute);

        // 2. Draw Active Route (Accent)
        const activePositions = steps.slice(0, currentStepIndex + 1).map(s => s.coordinates);
        if (activePositions.length > 1) {
            const activeRoute = L.polyline(activePositions, {
                color: '#fbbf24', // amber-400 (accent)
                weight: 3,
                opacity: 0.9
            }).addTo(map);
            polylinesRef.current.push(activeRoute);
        }

        // 3. Draw Start Point
        const startMarker = L.circleMarker(steps[0].coordinates, {
            radius: 4,
            fillColor: '#94a3b8',
            color: 'transparent',
            fillOpacity: 0.6
        }).addTo(map);
        markersRef.current.push(startMarker);

        // 4. Draw Current Position (Boat)
        const currentPos = steps[currentStepIndex].coordinates;

        // Custom Boat Icon (SVG)
        const boatIcon = L.divIcon({
            className: 'custom-boat-icon',
            html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22H22L12 2Z" fill="#fbbf24" stroke="white" stroke-width="2"/>
            </svg>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const boatMarker = L.marker(currentPos, { icon: boatIcon }).addTo(map);
        markersRef.current.push(boatMarker);

        // Pan to current position with appropriate zoom
        // If it's the first step, fit bounds to the whole route to show context
        if (currentStepIndex === 0) {
            map.fitBounds(fullRoute.getBounds(), { padding: [50, 50] });
        } else {
            map.flyTo(currentPos, 5, { duration: 1.5 });
        }

    }, [steps, currentStepIndex]);

    return (
        <div className="w-full h-full relative bg-[#000510]">
             <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
             {/* Map Controls could go here if managed internally */}
        </div>
    );
}
