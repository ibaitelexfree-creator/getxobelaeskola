import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MultiplayerLobbyProps {
    onJoin: (matchId: string) => void;
    userId: string;
}

export const MultiplayerLobby = ({ onJoin, userId }: MultiplayerLobbyProps) => {
    const supabase = createClient();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        setLoading(true);
        setError(null);
        // Generate random 6 char code
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data, error } = await supabase
            .from('regatta_matches')
            .insert({
                code: newCode,
                host_id: userId,
                status: 'waiting',
                config: {}
            })
            .select()
            .single();

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Auto join
        await handleJoin(data.code);
    };

    const handleJoin = async (inputCode: string) => {
        setLoading(true);
        setError(null);

        // Find match
        const { data: match, error: matchError } = await supabase
            .from('regatta_matches')
            .select('id, status')
            .eq('code', inputCode)
            .single();

        if (matchError || !match) {
            setError('Partida no encontrada');
            setLoading(false);
            return;
        }

        if (match.status !== 'waiting') {
            setError('Partida ya comenzada o finalizada');
            setLoading(false);
            return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('nombre, apellidos')
            .eq('id', userId)
            .single();

        const fullName = profile ? `${profile.nombre || ''} ${profile.apellidos || ''}`.trim() : '';
        const username = fullName || `Piloto ${userId.substring(0, 4)}`;

        // Add participant
        const { error: joinError } = await supabase
            .from('regatta_participants')
            .insert({
                match_id: match.id,
                user_id: userId,
                username,
                score: 0
            });

        // Ignore unique constraint error (user re-joining)
        if (joinError && !joinError.message.includes('unique constraint') && joinError.code !== '23505') {
             setError(joinError.message);
             setLoading(false);
             return;
        }

        onJoin(match.id);
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-8 w-full">
            <h1 className="text-4xl font-bold mb-8 text-cyan-400">Regata Multijugador</h1>

            <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-700">
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-slate-300">Unirse a Partida</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO"
                            className="bg-slate-900 border border-slate-600 rounded px-4 py-2 flex-1 text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button
                            onClick={() => handleJoin(code)}
                            disabled={loading || !code}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-6 py-2 rounded font-bold transition-colors text-white"
                        >
                            Unirse
                        </button>
                    </div>
                </div>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-slate-600"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500">O</span>
                    <div className="flex-grow border-t border-slate-600"></div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded font-bold text-cyan-400 transition-colors"
                >
                    Crear Nueva Sala
                </button>

                {error && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};
