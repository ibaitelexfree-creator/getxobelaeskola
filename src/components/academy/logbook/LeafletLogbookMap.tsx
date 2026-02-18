'use client';

import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface LeafletLogbookMapProps {
    sessions: any[];
    selectedPoint: any;
    setSelectedPoint: (p: any) => void;
}

export default function LeafletLogbookMap({ sessions, selectedPoint, setSelectedPoint }: LeafletLogbookMapProps) {
    if (typeof window === 'undefined') return null;

    return (
        <div className="w-full h-full relative" style={{ minHeight: '400px', background: '#050b14' }}>
            <MapContainer
                center={[43.35, -3.01]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
            </MapContainer>

            {/* HUD to confirm render */}
            <div className="absolute top-4 right-4 z-[1000] px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-[8px] font-black text-accent uppercase tracking-widest">
                Engine Active
            </div>
        </div>
    );
}
