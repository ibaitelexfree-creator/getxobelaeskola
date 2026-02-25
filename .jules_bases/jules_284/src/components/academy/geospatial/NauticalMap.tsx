'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER, MAP_CONFIG, NAUTICAL_CLUB, WAYPOINTS, NAVIGATION_ROUTE, DANGER_ZONE } from './map-data';

const NauticalMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return; // Already initialized

        // Fix Icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize Map
        const map = L.map(mapContainerRef.current).setView(MAP_CENTER, MAP_CONFIG.zoom);
        mapInstanceRef.current = map;

        // Tile Layer
        L.tileLayer(MAP_CONFIG.tileLayer, {
            attribution: MAP_CONFIG.attribution,
        }).addTo(map);

        // Club Marker
        const clubIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.marker([NAUTICAL_CLUB.lat, NAUTICAL_CLUB.lng], { icon: clubIcon })
            .addTo(map)
            .bindPopup(`<b>${NAUTICAL_CLUB.name}</b><br>${NAUTICAL_CLUB.description}`);

        // Waypoints
        WAYPOINTS.forEach(wp => {
            L.marker([wp.lat, wp.lng])
                .addTo(map)
                .bindPopup(`<b>${wp.name}</b><br>${wp.description}`);
        });

        // Route
        L.polyline(NAVIGATION_ROUTE, { color: 'blue', weight: 4, dashArray: '10, 10', opacity: 0.7 })
            .addTo(map)
            .bindPopup('Ruta de Navegación Sugerida');

        // Danger Zone
        L.polygon(DANGER_ZONE, { color: 'red', fillColor: 'red', fillOpacity: 0.2, weight: 2 })
            .addTo(map)
            .bindPopup('<div style="color:red;font-weight:bold">ZONA DE PELIGRO</div>Atención: Bajos rocosos.');

        // Cleanup
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%', minHeight: '500px', zIndex: 0 }} />

            {/* Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-white/90 p-4 rounded-xl shadow-lg z-[1000] text-black text-xs space-y-2 pointer-events-none">
                <h4 className="font-bold mb-2 uppercase tracking-wider text-slate-500">Leyenda</h4>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Club Náutico</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Waypoint Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-1 border-t-2 border-dashed border-blue-500"></div>
                    <span>Ruta Segura</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/50 border border-red-500"></div>
                    <span>Zona Peligrosa</span>
                </div>
            </div>
        </div>
    );
};

export default NauticalMap;
