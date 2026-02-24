'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import LeafletMap from '@/components/academy/dashboard/LeafletMap';
import { useWindSpeed } from '@/hooks/useWindSpeed';

interface LiveLocation {
    userId: string;
    lat: number;
    lng: number;
    speed: number | null;
    updatedAt: string;
    profile: {
        nombre: string;
        apellido: string;
        avatar_url: string | null;
    } | null;
}

export default function AdminLiveRadar() {
    const [locations, setLocations] = useState<LiveLocation[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [userTrack, setUserTrack] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const windSpeed = useWindSpeed();
    const supabase = createClient();

    // 1. Initial Load
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await fetch('/api/admin/live-map');
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data.locations || []);
                }
            } catch (err) {
                console.error('Error fetching initial live locations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitial();

        // 2. Realtime Subscription
        const channel = supabase
            .channel('admin-radar')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'user_live_locations' },
                async (payload) => {
                    // Refresh data on changes
                    // For simplicity, we refetch everything to get the joined profile info
                    // but in a more optimized version we would update the list manually
                    const res = await fetch('/api/admin/live-map');
                    if (res.ok) {
                        const data = await res.json();
                        setLocations(data.locations || []);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // 3. Fetch user track when selected
    useEffect(() => {
        if (!selectedUserId) {
            setUserTrack([]);
            return;
        }

        const fetchTrack = async () => {
            try {
                const res = await fetch(`/api/admin/user-track/${selectedUserId}`);
                if (res.ok) {
                    const data = await res.json();
                    // Merge track_log from today's sessions
                    const allPoints = (data.sessions || []).flatMap((s: any) => s.track_log || []);
                    setUserTrack(allPoints);
                }
            } catch (err) {
                console.error('Error fetching user track:', err);
            }
        };

        fetchTrack();
    }, [selectedUserId]);

    const selectedLocation = locations.find(l => l.userId === selectedUserId);

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                        Radar en Vivo
                    </h2>
                    <div className="mt-2 text-xs text-slate-400 flex justify-between">
                        <span>Viento: {windSpeed} kn</span>
                        <span>Activos: {locations.length}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Cargando...</div>
                    ) : locations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 italic">No hay alumnos en el mar ahora mismo.</div>
                    ) : (
                        <div className="divide-y divide-slate-900">
                            {locations.map((loc) => (
                                <button
                                    key={loc.userId}
                                    onClick={() => setSelectedUserId(loc.userId)}
                                    className={`w-full p-4 flex items-center gap-3 transition-colors text-left hover:bg-slate-900 ${selectedUserId === loc.userId ? 'bg-slate-900 ring-1 ring-inset ring-sky-500' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 relative overflow-hidden">
                                        {loc.profile?.avatar_url ? (
                                            <img src={loc.profile.avatar_url} alt="" className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-lg font-bold">
                                                {loc.profile?.nombre?.[0] || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{loc.profile?.nombre} {loc.profile?.apellido}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{loc.speed?.toFixed(1) || 0} kn</span>
                                            <span>•</span>
                                            <span>hace {Math.floor((Date.now() - new Date(loc.updatedAt).getTime()) / 1000)}s</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <LeafletMap
                    center={[43.3424, -3.0135]}
                    mappedSessions={[]} // Not needed here as we handle live markers separately or we could adapt it
                    livePoints={userTrack}
                    currentPosition={selectedLocation ? {
                        lat: selectedLocation.lat,
                        lng: selectedLocation.lng,
                        timestamp: new Date(selectedLocation.updatedAt).getTime(),
                        speed: selectedLocation.speed
                    } : null}
                />

                {/* User info Overlay on Map */}
                {selectedLocation && (
                    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl w-64 z-[1000]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">{selectedLocation.profile?.nombre}</h3>
                            <button onClick={() => setSelectedUserId(null)} className="text-slate-500 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Latitud:</span>
                                <span>{selectedLocation.lat.toFixed(5)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Longitud:</span>
                                <span>{selectedLocation.lng.toFixed(5)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Velocidad:</span>
                                <span className="text-sky-400 font-mono">{selectedLocation.speed?.toFixed(1) || 0} kn</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
