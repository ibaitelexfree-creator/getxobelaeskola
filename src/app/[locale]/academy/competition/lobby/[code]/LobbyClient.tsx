'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMultiplayerStore } from '@/lib/store/useMultiplayerStore';
import { createClient } from '@/lib/supabase/client';

export default function LobbyClient() {
    const params = useParams();
    const router = useRouter();
    const { joinMatch, matchState, isConnecting } = useMultiplayerStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const join = async () => {
            if (!params.code) return;

            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push(`/es/auth/login?returnTo=/academy/competition/lobby/${params.code}`);
                    return;
                }

                // If already connected to this match, don't rejoin
                if (matchState?.matchId === params.code) return;

                await joinMatch(params.code as string, user.id, user.user_metadata.full_name || 'Anonymous');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error joining lobby');
            }
        };

        join();
    }, [params.code, joinMatch, router, matchState?.matchId]);

    if (error) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
                    <p>{error}</p>
                    <button
                        onClick={() => router.push('/academy/competition')}
                        className="mt-4 px-6 py-2 bg-white/10 rounded hover:bg-white/20"
                    >
                        Back to Competition
                    </button>
                </div>
            </div>
        );
    }

    if (isConnecting || !matchState) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"/>
                    <p>Joining lobby...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nautical-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-display italic text-accent mb-2">Lobby</h1>
                    <p className="text-white/60">Match Code: {params.code}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Participants ({matchState.participants.length})</h2>
                        <ul className="space-y-2">
                            {matchState.participants.map((p: any) => (
                                <li key={p.id} className="flex items-center gap-2 text-white/80">
                                    <div className="w-2 h-2 rounded-full bg-green-500"/>
                                    {p.username}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <h2 className="text-xl font-bold mb-4">Waiting for Host</h2>
                        <p className="text-white/60 mb-8">The race will start soon...</p>
                        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-accent animate-spin"/>
                    </div>
                </div>
            </div>
        </div>
    );
}
