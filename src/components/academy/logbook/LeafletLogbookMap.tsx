'use client';

import React from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletLogbookMapProps {
    sessions: any[];
    selectedPoint: any;
    setSelectedPoint: (p: any) => void;
}

export default function LeafletLogbookMap({ sessions, selectedPoint, setSelectedPoint }: LeafletLogbookMapProps) {
    return (
        <MapContainer
            center={[43.35, -3.01]}
            zoom={13}
            style={{ height: '100%', width: '100%', background: '#050b14' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Tracks */}
            {sessions.filter(s => s.track_log && Array.isArray(s.track_log)).map((session) => (
                <Polyline
                    key={`track-${session.id}`}
                    positions={session.track_log!.map((p: any) => [p.lat, p.lng])}
                    pathOptions={{
                        color: selectedPoint?.id === session.id ? "#fbbf24" : "#0ea5e9",
                        weight: selectedPoint?.id === session.id ? 4 : 2,
                        opacity: selectedPoint?.id === session.id ? 1 : 0.6
                    }}
                    eventHandlers={{
                        click: () => setSelectedPoint(session)
                    }}
                />
            ))}

            {/* Markers */}
            {sessions.filter(s => s.ubicacion).map((point) => (
                <CircleMarker
                    key={point.id}
                    center={[point.ubicacion!.lat, point.ubicacion!.lng]}
                    radius={selectedPoint?.id === point.id ? 8 : 5}
                    pathOptions={{
                        fillColor: selectedPoint?.id === point.id ? '#fbbf24' : '#0ea5e9',
                        color: 'white',
                        weight: 1,
                        fillOpacity: 0.8
                    }}
                    eventHandlers={{
                        click: () => setSelectedPoint(point)
                    }}
                >
                    <Popup>
                        <div className="text-[10px] text-nautical-black font-bold uppercase">
                            {point.zona_nombre}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}
