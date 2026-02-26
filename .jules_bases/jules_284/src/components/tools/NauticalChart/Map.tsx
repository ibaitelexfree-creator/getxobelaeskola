'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue in Next.js
// We check if window is defined to avoid SSR errors although this component is dynamically imported with ssr: false
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface NauticalMapProps {
    activeTool: 'navigate' | 'route' | 'waypoint';
    routePoints: [number, number][];
    waypoints: { position: [number, number]; label: string }[];
    onMapClick: (latlng: [number, number]) => void;
    onMouseMove: (latlng: [number, number]) => void;
}

function MapEvents({ activeTool, onMapClick, onMouseMove }: { activeTool: string, onMapClick: (l: [number, number]) => void, onMouseMove: (l: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            if (activeTool !== 'navigate') {
                onMapClick([e.latlng.lat, e.latlng.lng]);
            }
        },
        mousemove(e) {
            onMouseMove([e.latlng.lat, e.latlng.lng]);
        }
    });
    return null;
}

export default function NauticalMap({ activeTool, routePoints, waypoints, onMapClick, onMouseMove }: NauticalMapProps) {
    // Bizkaia center - Approx Getxo/Abra
    const center: [number, number] = [43.35, -3.02];

    return (
        <MapContainer center={center} zoom={12} className="w-full h-full z-0 bg-blue-50">
             {/* Base Layer: OpenStreetMap */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Overlay: OpenSeaMap */}
            <TileLayer
                url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                attribution='Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
            />

            <MapEvents activeTool={activeTool} onMapClick={onMapClick} onMouseMove={onMouseMove} />

            {/* Route Line */}
            {routePoints.length > 0 && (
                <Polyline positions={routePoints} color="#ef4444" dashArray="10, 10" weight={3} />
            )}

            {/* Route Points */}
            {routePoints.map((point, idx) => (
                <Marker key={`rp-${idx}`} position={point} icon={
                    new L.DivIcon({
                        className: 'bg-transparent',
                        html: `<div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    })
                } />
            ))}

            {/* Waypoints */}
            {waypoints.map((wp, idx) => (
                <Marker key={`wp-${idx}`} position={wp.position}>
                    <Popup>{wp.label}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
