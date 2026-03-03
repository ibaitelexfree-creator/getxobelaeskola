'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiplayerStore } from '@/lib/store/useMultiplayerStore';
import { createClient } from '@/lib/supabase/client';

export default function CompetitionPage() {
    const router = useRouter();
    const [joinCode, setJoinCode] = useState('');
    const [username, setUsername] = useState('');
    const createLobby = useMultiplayerStore(state => state.createLobby);
    const joinLobby = useMultiplayerStore(state => state.joinLobby);

    const handleCreate = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // For MVP, allow anonymous if auth fails? Or require login.
            // Let's assume login is required for persistent ID.
            // But for testing, maybe generate random ID?
            // "Alumnos" implies logged in users.
            alert('Debes iniciar sesión para crear una regata.');
            return;
        }

        const name = username || user.email?.split('@')[0] || 'Skipper';
        const code = await createLobby(user.id, name);
        if (code) {
            router.push(`/academy/competition/lobby/${code}`);
        } else {
            alert('Error al crear la sala.');
        }
    };

    const handleJoin = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('Debes iniciar sesión para unirte.');
            return;
        }

        const code = joinCode.trim().toUpperCase();
        if (!code) return;

        const name = username || user.email?.split('@')[0] || 'Skipper';
        const success = await joinLobby(code, user.id, name);

        if (success) {
            router.push(`/academy/competition/lobby/${code}`);
        } else {
            alert('Error al unirse. Verifica el código.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-8 text-cyan-400 tracking-wider uppercase italic">Modo Competición</h1>

            <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md p-8 rounded-xl border border-cyan-900 shadow-2xl shadow-cyan-900/20">
                <div className="mb-8">
                    <label className="block text-xs font-bold text-cyan-500 mb-2 uppercase tracking-wider">Nombre de Piloto</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                        placeholder="Tu nombre (opcional)"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleCreate}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-900/50 uppercase tracking-wide"
                    >
                        Crear Nueva Regata
                    </button>

                    <div className="relative flex py-4 items-center">
                        <div className="flex-grow border-t border-gray-800"></div>
                        <span className="flex-shrink mx-4 text-gray-600 text-xs uppercase tracking-widest">O únete a una existente</span>
                        <div className="flex-grow border-t border-gray-800"></div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="flex-grow bg-black/50 border border-gray-700 rounded-lg p-3 text-white uppercase text-center tracking-[0.2em] font-mono text-xl focus:border-cyan-500 outline-none transition-colors placeholder-gray-700"
                            placeholder="CÓDIGO"
                            maxLength={6}
                        />
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={!joinCode}
                        className={`w-full font-bold py-3 px-6 rounded-lg transition-all uppercase tracking-wide ${
                            joinCode
                            ? 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer hover:scale-[1.02]'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        Unirse a Sala
                    </button>
                </div>
            </div>
        </div>
    );
}
