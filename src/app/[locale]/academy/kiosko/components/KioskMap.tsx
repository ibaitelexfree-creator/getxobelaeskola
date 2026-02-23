'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const MOCK_ROUTE: [number, number][] = [
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
            const boatIconHtml = `
                <div class='marker-pin'></div>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#c30b82' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='marker-icon'>
                    <path d='M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>
                    <path d='M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.82 7'/>
                    <path d='M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6'/>
                    <path d='M12 10V4'/>
                    <path d='M12 2v1'/>
                    <path d='M12 7h5'/>
                </svg>
            `;

            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: boatIconHtml,
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            });

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
            L.marker(MOCK_ROUTE[0] as [number, number], { icon: customIcon }).addTo(map).bindPopup("Salida: Getxo");
            L.marker(MOCK_ROUTE[MOCK_ROUTE.length - 1] as [number, number], { icon: customIcon }).addTo(map).bindPopup("Llegada: Castro");

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
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-div-icon {
                    background: none !important;
                    border: none !important;
                }
                .marker-pin {
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    background: #c30b82;
                    position: absolute;
                    transform: rotate(-45deg);
                    left: 50%;
                    top: 50%;
                    margin: -15px 0 0 -15px;
                }
                .marker-pin::after {
                    content: '';
                    width: 24px;
                    height: 24px;
                    margin: 3px 0 0 3px;
                    background: #fff;
                    position: absolute;
                    border-radius: 50%;
                }
                .marker-icon {
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    left: 0;
                    right: 0;
                    margin: 6px auto;
                    text-align: center;
                    color: #c30b82;
                    z-index: 10;
                }
            `}} />
             <div ref={mapRef} className="w-full h-full bg-[#0a1628]" />
             <div className="absolute top-12 left-12 z-[1000] pointer-events-none">
                <h2 className="text-white font-display italic text-5xl drop-shadow-md">Ruta del Día</h2>
                <p className="text-white/60 text-xl font-light mt-2">Getxo ➔ Castro Urdiales</p>
             </div>
        </div>
    );
}
