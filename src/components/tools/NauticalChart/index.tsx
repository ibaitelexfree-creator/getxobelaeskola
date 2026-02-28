'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Controls from './Controls';
import InfoPanel from './InfoPanel';
import SymbolLegend from './SymbolLegend';
import * as turf from '@turf/turf';
import { useTranslations } from 'next-intl';

// Dynamically import Map to disable SSR
const NauticalMap = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">Cargando Carta Náutica...</div>
});

export default function NauticalChart() {
    const t = useTranslations('nautical_chart');
    const [activeTool, setActiveTool] = useState<'navigate' | 'route' | 'waypoint'>('navigate');
    const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
    const [waypoints, setWaypoints] = useState<{ position: [number, number]; label: string }[]>([]);
    const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null);

    // Calculate distance of the route
    const routeDistance = useMemo(() => {
        if (routePoints.length < 2) return 0;
        // Convert to GeoJSON LineString (lng, lat order for Turf)
        try {
            const line = turf.lineString(routePoints.map(p => [p[1], p[0]]));
            // @ts-ignore: Turf types sometimes mismatch with options object but units: 'nauticalmiles' is valid
            return turf.length(line, { units: 'nauticalmiles' });
        } catch (e) {
            console.error("Error calculating distance", e);
            return 0;
        }
    }, [routePoints]);

    // Calculate bearing of the last leg
    const bearing = useMemo(() => {
        if (routePoints.length < 2) return null;
        const p1 = routePoints[routePoints.length - 2];
        const p2 = routePoints[routePoints.length - 1];
        // Turf expects [lng, lat]
        const from = turf.point([p1[1], p1[0]]);
        const to = turf.point([p2[1], p2[0]]);
        let b = turf.bearing(from, to);
        if (b < 0) b += 360;
        return b;
    }, [routePoints]);

    const handleMapClick = useCallback((latlng: [number, number]) => {
        if (activeTool === 'route') {
            setRoutePoints(prev => [...prev, latlng]);
        } else if (activeTool === 'waypoint') {
            const label = `WP ${waypoints.length + 1}`;
            setWaypoints(prev => [...prev, { position: latlng, label }]);
        }
    }, [activeTool, waypoints.length]);

    const handleClear = useCallback(() => {
        setRoutePoints([]);
        setWaypoints([]);
    }, []);

    const handleMouseMove = useCallback((latlng: [number, number]) => {
        setCursorPosition(latlng);
    }, []);

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-display italic text-nautical-blue">{t('title')}</h1>
                <p className="text-slate-500 font-light tracking-wide text-sm md:text-base max-w-2xl">{t('subtitle')}</p>
            </div>

            <div className="relative w-full h-[70vh] min-h-[500px] border border-slate-200 rounded-2xl overflow-hidden shadow-2xl bg-slate-50 ring-4 ring-white ring-offset-2 ring-offset-slate-100">
                <Controls activeTool={activeTool} onToolChange={setActiveTool} onClear={handleClear} />

                <NauticalMap
                    activeTool={activeTool}
                    routePoints={routePoints}
                    waypoints={waypoints}
                    onMapClick={handleMapClick}
                    onMouseMove={handleMouseMove}
                />

                <InfoPanel
                    cursorPosition={cursorPosition}
                    routeDistance={routeDistance}
                    bearing={bearing}
                />

                <SymbolLegend />
            </div>
        </div>
    );
}
