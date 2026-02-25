'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { calculateDistance, calculateBearing } from '@/lib/geospatial/nautical-calculations';
import { Trash2, RotateCcw, Map as MapIcon, Info, Anchor, Navigation } from 'lucide-react';

// Import Map dynamically to avoid SSR issues with Leaflet
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-slate-100 text-slate-500">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        <p>Cargando Carta Náutica...</p>
      </div>
    </div>
  )
});

// Re-export or redefine Waypoint type if needed, but for now we define it here or import from Map
import type { Waypoint } from './Map';

export default function NauticalChartTool() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [showLegend, setShowLegend] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      lat,
      lng
    };
    setWaypoints((prev) => [...prev, newWaypoint]);
  };

  const clearRoute = () => setWaypoints([]);

  const undoLast = () => {
    setWaypoints((prev) => prev.slice(0, -1));
  };

  // Calculations
  const stats = useMemo(() => {
    if (waypoints.length < 2) {
      return { totalDistance: 0, lastLegDist: 0, lastLegBearing: 0 };
    }

    let totalDist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDist += calculateDistance(
        waypoints[i].lat, waypoints[i].lng,
        waypoints[i+1].lat, waypoints[i+1].lng
      );
    }

    const last = waypoints[waypoints.length - 1];
    const prev = waypoints[waypoints.length - 2];
    const lastLegDist = calculateDistance(prev.lat, prev.lng, last.lat, last.lng);
    const lastLegBearing = calculateBearing(prev.lat, prev.lng, last.lat, last.lng);

    return {
      totalDistance: totalDist,
      lastLegDist,
      lastLegBearing
    };
  }, [waypoints]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-white pt-[140px]">
      {/* Header / Toolbar */}
      <div className="bg-brand-blue text-white p-4 flex flex-wrap items-center justify-between gap-4 shadow-md z-10">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MapIcon size={24} />
            Carta Náutica (OpenSeaMap)
          </h1>
          <p className="text-xs text-blue-200">Planificador de rutas y calculadora de rumbos</p>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono bg-white/10 p-2 rounded">
          <div className="flex flex-col px-2 border-r border-white/20">
            <span className="text-xs text-blue-200">Distancia Total</span>
            <span className="font-bold">{stats.totalDistance.toFixed(2)} NM</span>
          </div>
          {waypoints.length > 1 && (
            <>
              <div className="flex flex-col px-2 border-r border-white/20">
                <span className="text-xs text-blue-200">Tramo (Dist)</span>
                <span>{stats.lastLegDist.toFixed(2)} NM</span>
              </div>
              <div className="flex flex-col px-2">
                <span className="text-xs text-blue-200">Rumbo</span>
                <span className="font-bold text-brand-accent">{Math.round(stats.lastLegBearing)}°</span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded flex items-center gap-2 transition"
            title="Leyenda"
          >
            <Info size={18} />
            <span className="hidden sm:inline">Leyenda</span>
          </button>
          <button
            onClick={undoLast}
            disabled={waypoints.length === 0}
            className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded flex items-center gap-2 transition"
            title="Deshacer último punto"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={clearRoute}
            disabled={waypoints.length === 0}
            className="p-2 bg-red-500/80 hover:bg-red-600 rounded flex items-center gap-2 transition"
            title="Borrar Ruta"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex">
        {/* Map Container */}
        <div className="flex-1 relative bg-slate-100">
           <Map waypoints={waypoints} onMapClick={handleMapClick} />
        </div>

        {/* Legend Sidebar (Overlay on mobile, sidebar on desktop if we wanted, but let's make it an overlay for max map space) */}
        {showLegend && (
          <div className="absolute top-4 right-4 z-[500] bg-white p-4 rounded shadow-lg max-w-xs border border-slate-200 animate-fade-in">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="font-bold text-brand-blue">Simbología</h3>
              <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-green-500 block"></span>
                <span>Boya Lateral (Estribor/Babor según región)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-red-500 block"></span>
                <span>Boya Lateral (Babor/Estribor)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-yellow-400 border border-black block"></span>
                <span>Boya Cardinal / Especial</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="relative">
                    <span className="text-purple-600">★</span>
                </div>
                <span>Faro / Luz</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="font-bold text-slate-700 text-xs border border-slate-400 px-1">+</span>
                <span>Roca sumergida / Peligro</span>
              </li>
              <li className="flex items-center gap-3">
                <Anchor size={14} className="text-blue-800" />
                <span>Fondeadero</span>
              </li>
            </ul>
            <div className="mt-4 pt-2 border-t text-xs text-slate-500">
              Datos provistos por OpenSeaMap. <br/>No usar para navegación real.
            </div>
          </div>
        )}

        {/* Instructions Overlay (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-[400] pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded shadow text-sm text-slate-700 border border-slate-200 pointer-events-auto">
                {waypoints.length === 0 ? (
                    <p className="flex items-center gap-2"><Navigation size={16} /> Haz clic en el mapa para iniciar ruta</p>
                ) : (
                    <div className="flex flex-col gap-1">
                        <p className="font-bold text-brand-blue">Waypoints: {waypoints.length}</p>
                        <div className="max-h-32 overflow-y-auto text-xs font-mono space-y-1 pr-2">
                            {waypoints.map((wp, i) => (
                                <div key={wp.id} className="flex justify-between gap-4">
                                    <span>{i+1}.</span>
                                    <span>{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
