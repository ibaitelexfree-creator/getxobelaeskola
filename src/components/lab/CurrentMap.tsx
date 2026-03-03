'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getTideLevel } from '@/lib/puertos-del-estado';
import { addMinutes } from 'date-fns';
import 'leaflet/dist/leaflet.css';

interface CurrentMapProps {
    date: Date;
}

export default function CurrentMap({ date }: CurrentMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const LRef = useRef<any>(null);
    const layerRef = useRef<any>(null); // LayerGroup for arrows
    const initializing = useRef(false);

    // Calculate current state
    const [currentState, setCurrentState] = useState({ speed: 0, direction: 0, type: 'SLACK' });

    useEffect(() => {
        // Calculate current based on rate of change
        const t0 = date;
        const t1 = addMinutes(date, 5);
        const h0 = getTideLevel(t0);
        const h1 = getTideLevel(t1);
        const delta = h1 - h0; // Change in 5 mins

        // Max range is approx 3m. Max change in 6h (360m) is 3m. Avg 0.008 m/min.
        // Max rate is at mid-tide.
        // Let's normalize speed 0 to 1.

        const rate = delta; // meters per 5 min
        // Max rate happens when sin(wt) is 1.
        // A * w = 1.5 * (2*PI / (12.42*60)) approx 0.012 m/min.
        // So 5 min delta is approx 0.06m.

        const speedFactor = Math.min(Math.abs(rate) / 0.06, 1);

        let direction = 0;
        let type = 'SLACK';

        if (Math.abs(speedFactor) < 0.1) {
            type = 'SLACK'; // Repunte
        } else if (rate > 0) {
            type = 'FLOOD'; // Subida -> Filling the bay -> Direction approx 135 deg (SE)
            direction = 135;
        } else {
            type = 'EBB'; // Bajada -> Emptying the bay -> Direction approx 315 deg (NW)
            direction = 315;
        }

        setCurrentState({ speed: speedFactor, direction, type });

    }, [date]);

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current || mapInstance.current || initializing.current) return;

        const initMap = async () => {
            if (!mapRef.current || initializing.current) return;
            initializing.current = true;

            const L = (await import('leaflet')).default;
            LRef.current = L;

            if (!mapRef.current || (mapRef.current as any)._leaflet_id) {
                return;
            }

            const map = L.map(mapRef.current, {
                zoomControl: true,
                attributionControl: false,
                scrollWheelZoom: false
            }).setView([43.345, -3.02], 13); // Centered on Abra

            // Dark map style
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

            const layerGroup = L.layerGroup().addTo(map);
            layerRef.current = layerGroup;
            mapInstance.current = map;

            // Initial draw
            updateArrows();
        };

        initMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Effect to update arrows when state changes
    useEffect(() => {
        updateArrows();
    }, [currentState]);

    const updateArrows = () => {
        const map = mapInstance.current;
        const L = LRef.current;
        const layer = layerRef.current;

        if (!map || !L || !layer) return;

        layer.clearLayers();

        if (currentState.type === 'SLACK') return;

        // Grid of points in the bay
        const points = [
            [43.35, -3.04], [43.35, -3.02], [43.35, -3.00],
            [43.34, -3.04], [43.34, -3.02], [43.34, -3.00],
            [43.33, -3.03], [43.33, -3.01],
            [43.36, -3.05], [43.36, -3.03]
        ];

        points.forEach(pt => {
            // Create arrow icon
            // Scale and opacity based on speed
            const size = 20 + (currentState.speed * 20); // 20 to 40px
            const opacity = 0.3 + (currentState.speed * 0.7);

            const arrowHtml = `
                <div style="
                    transform: rotate(${currentState.direction}deg);
                    opacity: ${opacity};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: ${size}px;
                    height: ${size}px;
                    transition: all 0.5s ease;
                ">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L12 22M12 2L5 9M12 2L19 9" stroke="${currentState.type === 'FLOOD' ? '#3b82f6' : '#f97316'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            `;

            const icon = L.divIcon({
                html: arrowHtml,
                className: 'current-arrow-icon',
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
            });

            L.marker(pt, { icon }).addTo(layer);
        });
    };

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div ref={mapRef} style={{ height: '100%', width: '100%', background: '#0a1628' }} />

            {/* Overlay Info */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 z-[1000] pointer-events-none">
                <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">ESTADO DE LA CORRIENTE</div>
                <div className="text-xl font-black text-white flex items-center gap-2">
                    {currentState.type === 'SLACK' && <span className="text-white/60">REPUNTE (SIN CORRIENTE)</span>}
                    {currentState.type === 'FLOOD' && <span className="text-blue-400">FLUJO (ENTRANTE)</span>}
                    {currentState.type === 'EBB' && <span className="text-orange-400">REFLUJO (SALIENTE)</span>}
                </div>
                <div className="mt-2 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${currentState.type === 'FLOOD' ? 'bg-blue-500' : currentState.type === 'EBB' ? 'bg-orange-500' : 'bg-white/20'}`}
                        style={{ width: `${currentState.speed * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/30">Débil</span>
                    <span className="text-[10px] text-white/30">Fuerte</span>
                </div>
            </div>
        </div>
    );
}
