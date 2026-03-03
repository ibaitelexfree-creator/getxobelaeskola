'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { SimulatorSkeleton } from '@/components/academy/sailing-simulator/SimulatorSkeleton';
import { useMultiplayerStore } from '@/lib/store/useMultiplayerStore';
import { createClient } from '@/lib/supabase/client';

const SailingSimulator = dynamic(
    () => import('@/components/academy/sailing-simulator/SailingSimulator').then(mod => mod.SailingSimulator),
    {
        ssr: false,
        loading: () => <SimulatorSkeleton />
    }
);

export default function RaceClient() {
    const { code } = useParams();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    const lobby = useMultiplayerStore(state => state.lobby);
    const joinLobby = useMultiplayerStore(state => state.joinLobby);

    useEffect(() => {
        const init = async () => {
            if (lobby && lobby.code === code) {
                setReady(true);
                return;
            }

            // Re-join logic for page refresh
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/academy/competition');
                return;
            }

            // We assume username is already in DB if we are rejoining, passing email as fallback
            const success = await joinLobby(code as string, user.id, user.email?.split('@')[0] || 'Skipper');
            if (success) {
                setReady(true);
            } else {
                router.push('/academy/competition');
            }
        };
        init();
    }, [code, lobby, joinLobby, router]);

    if (!ready) return <div className="w-full h-screen bg-black text-white flex items-center justify-center font-mono tracking-widest animate-pulse">CONECTANDO A SISTEMAS DE NAVEGACIÓN...</div>;

    return (
        <main className="w-full h-screen bg-black">
            <SailingSimulator mode="multiplayer" lobbyCode={code as string} />
        </main>
    );
}
