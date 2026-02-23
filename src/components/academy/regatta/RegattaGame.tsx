'use client';

import React, { useState, useEffect } from 'react';
import { SailingSimulator } from '../sailing-simulator/SailingSimulator';
import { MultiplayerLobby } from './MultiplayerLobby';
import { useRegattaSocket } from '@/hooks/useRegattaSocket';
import { createClient } from '@/lib/supabase/client';

export const RegattaGame = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [matchId, setMatchId] = useState<string | null>(null);
    const { opponents, matchStatus, isConnected, broadcastState } = useRegattaSocket(matchId, userId, null);

    useEffect(() => {
        // Fetch user
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }: { data: any }) => {
            if (data.user) {
                setUserId(data.user.id);
            }
        });
    }, []);

    if (!userId) {
        return <div className="text-white text-center mt-20">Cargando usuario...</div>;
    }

    if (!matchId) {
        return (
            <div className="w-full h-screen bg-slate-900">
                <MultiplayerLobby onJoin={setMatchId} userId={userId} />
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-black">
            {/* Status Overlay */}
            <div className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded backdrop-blur-sm pointer-events-none">
                <div>Estado: <span className="font-bold text-cyan-400">{matchStatus.toUpperCase()}</span></div>
                <div>Oponentes: {opponents.length}</div>
                <div className="text-xs text-gray-400">{isConnected ? 'Conectado' : 'Reconectando...'}</div>
            </div>

            <SailingSimulator
                onStateUpdate={broadcastState}
                opponents={opponents}
            />
        </div>
    );
};
