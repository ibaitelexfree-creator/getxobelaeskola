'use client';

import React from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '@/hooks/useSmartTracker';

interface LeafletMapProps {
    center: [number, number];
    mappedSessions: any[];
    livePoints: LocationPoint[];
    currentPosition: LocationPoint | null;
}

export default function LeafletMap({ center, mappedSessions, livePoints, currentPosition }: LeafletMapProps) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', background: '#0a1628' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            {/* Historical Tracks */}
            {mappedSessions.map((s) => (
                <React.Fragment key={s.id}>
                    {s.track_log && Array.isArray(s.track_log) && (
                        <Polyline
                            positions={s.track_log.map((p: any) => [p.lat, p.lng])}
                            pathOptions={{ color: '#0ea5e9', weight: 2, opacity: 0.4 }}
                        />
                    )}
                    <CircleMarker
                        center={[s.ubicacion.lat, s.ubicacion.lng]}
                        radius={4}
                        pathOptions={{ fillColor: '#0ea5e9', color: 'white', weight: 1, fillOpacity: 0.8 }}
                    >
                        <Popup>
                            <div className="text-[10px] text-nautical-black font-bold uppercase">
                                {s.zona_nombre}
                            </div>
                        </Popup>
                    </CircleMarker>
                </React.Fragment>
            ))}

            {/* Live Tracking Path */}
            {livePoints.length > 0 && (
                <Polyline
                    positions={livePoints.map(p => [p.lat, p.lng])}
                    pathOptions={{ color: '#fbbf24', weight: 3, dashArray: '5, 10', opacity: 0.8 }}
                />
            )}

            {/* Current Position Marker */}
            {currentPosition && (
                <CircleMarker
                    center={[currentPosition.lat, currentPosition.lng]}
                    radius={6}
                    pathOptions={{ fillColor: '#fbbf24', color: '#fbbf24', weight: 10, opacity: 0.3 }}
                />
            )}
        </MapContainer>
    );
}
