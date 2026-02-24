'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FogRenderer } from '@/lib/geospatial/fog-renderer';
import waterGeometry from '@/data/geospatial/water-geometry.json';
import { createClient } from '@/lib/supabase/client';

export default function FogOfWarMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mapInstance = useRef<any>(null);
    const [segments, setSegments] = useState<any[]>([]);
    const [stats, setStats] = useState({ miles: 0, percent: 0 });
    const supabase = createClient();

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current) return;

        const initMap = async () => {
            const L = (await import('leaflet')).default;

            // 1. Initialize Map
            const map = L.map(mapRef.current!, {
                zoomControl: false,
                attributionControl: false
            }).setView([43.3424, -3.0135], 14);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

            // 2. Add "Fog" Overlay (Water mask)
            // This represents unexplored water
            const waterOverlay = L.geoJSON(waterGeometry as any, {
                style: {
                    color: '#082f49',
                    weight: 0,
                    fillColor: '#082f49',
                    fillOpacity: 0.6
                }
            }).addTo(map);

            // 3. Custom Canvas Layer for Fog-of-War
            const CanvasLayer = L.Layer.extend({
                onAdd: function (m: any) {
                    const container = L.DomUtil.create('canvas', 'leaflet-zoom-animated');
                    this._canvas = container;
                    m.getPanes().overlayPane.appendChild(container);
                    m.on('moveend', this._update, this);
                    this._update();
                },
                onRemove: function (m: any) {
                    m.getPanes().overlayPane.removeChild(this._canvas);
                    m.off('moveend', this._update, this);
                },
                _update: function () {
                    const m = this._map;
                    const c = this._canvas;
                    const size = m.getSize();
                    const pos = m.latLngToLayerPoint(m.getBounds().getNorthWest());

                    L.DomUtil.setPosition(c, pos);
                    c.width = size.x;
                    c.height = size.y;

                    // Draw the updated exploration segments
                    const ctx = c.getContext('2d');
                    if (ctx) {
                        FogRenderer.drawSegments(ctx, segments, m, L);
                    }
                }
            });

            const explorationLayer = new (CanvasLayer as any)();
            explorationLayer.addTo(map);

            mapInstance.current = map;

            // Trigger initial fetch
            fetchData();
        };

        const fetchData = async () => {
            const res = await fetch('/api/exploration/my-tracks');
            if (res.ok) {
                const data = await res.json();
                setSegments(data.segments || []);
            }
        };

        initMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
            }
        };
    }, []);

    // Re-render canvas when segments change
    useEffect(() => {
        if (mapInstance.current && segments.length > 0) {
            // Signal leaflet to re-trigger the _update on the custom layer
            // or we can manually find the layer and call update
            mapInstance.current.fire('moveend');
        }
    }, [segments]);

    return (
        <div className="relative w-full h-full bg-slate-950">
            <div ref={mapRef} className="w-full h-full" />

            {/* Legend & Stats Overlay */}
            <div className="absolute bottom-6 right-6 z-[1000] space-y-4">
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl w-56">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Leyenda de Exploración</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-[#082f49] border border-slate-600"></div>
                            <span className="text-xs text-slate-300">Aguas Desconocidas</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-sky-900/50"></div>
                            <span className="text-xs text-slate-300">Primera Pasada</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-sky-400"></div>
                            <span className="text-xs text-slate-300">Ruta Frecuente</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-white shadow-[0_0_10px_#0ea5e9]"></div>
                            <span className="text-xs text-slate-300">Aguas Dominadas</span>
                        </div>
                    </div>
                </div>

                <div className="bg-sky-600 p-4 rounded-xl shadow-lg flex justify-between items-center text-white">
                    <div>
                        <div className="text-[10px] uppercase font-bold opacity-80">Explorado</div>
                        <div className="text-2xl font-black italic">14%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold opacity-80">Rango</div>
                        <div className="text-lg font-bold">24 nm</div>
                    </div>
                </div>
            </div>

            {/* Title Overlay */}
            <div className="absolute top-6 left-6 z-[1000]">
                <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-sky-500/30 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                    <span className="text-sm font-medium tracking-tight">Mapa de Descubrimientos</span>
                </div>
            </div>
        </div>
    );
}
