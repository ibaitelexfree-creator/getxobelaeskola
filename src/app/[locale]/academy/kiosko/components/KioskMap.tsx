'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const MOCK_ROUTE = [
    [43.345, -3.025], // Getxo Puerto
    [43.355, -3.040], // Salida Abra
    [43.365, -3.060], // Punta Galea
    [43.375, -3.090], // Costa
    [43.385, -3.120], // Barrika
    [43.390, -3.150], // Plentzia approach (just illustrating a route)
    [43.395, -3.180],
    [43.390, -3.210], // Castro approach
    [43.385, -3.220], // Castro Puerto
];

export default function KioskMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const LRef = useRef<any>(null);
    const initializing = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current || mapInstance.current || initializing.current) return;

        const initMap = async () => {
            if (!mapRef.current || initializing.current) return;
            initializing.current = true;

            const L = (await import('leaflet')).default;
            LRef.current = L;

            // Final check on DOM element
            if (!mapRef.current || (mapRef.current as any)._leaflet_id) {
                return;
            }

            // Fix marker icons
            // Delete _getIconUrl to force Leaflet to use the default one, but better to just use circles or custom icons to avoid assets issues

            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false
            }).setView([43.37, -3.12], 12); // Centered between Getxo and Castro

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Add Route
            const polyline = L.polyline(MOCK_ROUTE, {
                color: '#fbbf24', // Amber/Accent
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);

            // Add Start/End Markers
            L.circleMarker(MOCK_ROUTE[0], {
                radius: 8,
                fillColor: '#0ea5e9', // Sky Blue
                color: '#ffffff',
                weight: 2,
                fillOpacity: 1
            }).addTo(map).bindPopup("Salida: Getxo");

            L.circleMarker(MOCK_ROUTE[MOCK_ROUTE.length - 1], {
                radius: 8,
                fillColor: '#22c55e', // Green
                color: '#ffffff',
                weight: 2,
                fillOpacity: 1
            }).addTo(map).bindPopup("Llegada: Castro");

            // Fit bounds to route
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

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

    return (
        <div className="w-full h-full relative">
             <div ref={mapRef} className="w-full h-full bg-[#0a1628]" />
             <div className="absolute top-12 left-12 z-[1000] pointer-events-none">
                <h2 className="text-white font-display italic text-5xl drop-shadow-md">Ruta del Día</h2>
                <p className="text-white/60 text-xl font-light mt-2">Getxo ➔ Castro Urdiales</p>
             </div>
        </div>
    );
}
