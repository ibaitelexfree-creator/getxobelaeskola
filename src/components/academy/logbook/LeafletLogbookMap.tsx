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
    if (typeof window === 'undefined') return null;

    return (
        <div style={{ height: '100%', width: '100%' }}>
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
                {Array.isArray(sessions) && sessions
                    .filter(s => s.track_log && Array.isArray(s.track_log))
                    .map((session) => {
                        const validPositions = session.track_log
                            ?.map((p: any) => {
                                const lat = typeof p.lat === 'string' ? parseFloat(p.lat) : p.lat;
                                const lng = typeof p.lng === 'string' ? parseFloat(p.lng) : p.lng;
                                if (isNaN(lat) || isNaN(lng)) return null;
                                return [lat, lng] as [number, number];
                            })
                            .filter((p: [number, number] | null): p is [number, number] => p !== null) || [];

                        if (validPositions.length < 2) return null;

                        return (
                            <Polyline
                                key={`track-${session.id}`}
                                positions={validPositions}
                                pathOptions={{
                                    color: selectedPoint?.id === session.id ? "#fbbf24" : "#0ea5e9",
                                    weight: selectedPoint?.id === session.id ? 4 : 2,
                                    opacity: selectedPoint?.id === session.id ? 1 : 0.6
                                }}
                                eventHandlers={{
                                    click: () => setSelectedPoint(session)
                                }}
                            />
                        );
                    })}

                {/* Markers */}
                {Array.isArray(sessions) && sessions
                    .filter(s => s.ubicacion &&
                        (typeof s.ubicacion.lat === 'number' || typeof s.ubicacion.lat === 'string') &&
                        (typeof s.ubicacion.lng === 'number' || typeof s.ubicacion.lng === 'string'))
                    .map((point) => {
                        const lat = typeof point.ubicacion!.lat === 'string' ? parseFloat(point.ubicacion!.lat) : point.ubicacion!.lat;
                        const lng = typeof point.ubicacion!.lng === 'string' ? parseFloat(point.ubicacion!.lng) : point.ubicacion!.lng;

                        if (isNaN(lat) || isNaN(lng)) return null;

                        return (
                            <CircleMarker
                                key={point.id}
                                center={[lat, lng]}
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
                                    <div className="text-[10px] text-black font-bold uppercase">
                                        {point.zona_nombre}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
            </MapContainer>
        </div>
    );
}
