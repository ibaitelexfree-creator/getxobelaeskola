import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { RaceLobby, RaceParticipant, MultiplayerBoatState } from '@/types/competition';

interface MultiplayerStore {
    lobby: RaceLobby | null;
    participants: RaceParticipant[];
    opponents: Record<string, MultiplayerBoatState>;
    channel: RealtimeChannel | null;
    playerId: string | null;
    isHost: boolean;

    // Actions
    createLobby: (userId: string, username: string) => Promise<string | null>;
    joinLobby: (code: string, userId: string, username: string) => Promise<boolean>;
    leaveLobby: () => Promise<void>;
    startGame: () => Promise<void>;
    finishRace: (score: number) => Promise<void>;
    broadcastPosition: (state: Omit<MultiplayerBoatState, 'userId' | 'timestamp'>) => void;
    reset: () => void;
}

const supabase = createClient();

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
    lobby: null,
    participants: [],
    opponents: {},
    channel: null,
    playerId: null,
    isHost: false,

    createLobby: async (userId: string, username: string) => {
        // Generate a secure 6-character alphanumeric room code
        let code = 'AAAAAA'; // Safe SSR fallback
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const randomValues = new Uint8Array(16); // Fetch more than we need to avoid modulo bias
            crypto.getRandomValues(randomValues);
            let result = '';
            for (let i = 0; i < randomValues.length && result.length < 6; i++) {
                // To avoid modulo bias, only use values strictly less than a multiple of the charset length.
                // 256 (Uint8 max) % 36 = 4. 256 - 4 = 252. We only accept values < 252.
                if (randomValues[i] < 252) {
                    result += charset[randomValues[i] % charset.length];
                }
            }
            // If we somehow didn't get 6 characters, fall back to UUID logic
            code = result.length === 6 ? result : crypto.randomUUID().substring(0, 6).toUpperCase();
        } else if (typeof crypto !== 'undefined' && crypto.randomUUID) {
             // Fallback to randomUUID if getRandomValues is somehow unavailable
             code = crypto.randomUUID().substring(0, 6).toUpperCase();
        }

        const { data: lobby, error } = await supabase
            .from('race_lobbies')
            .insert({
                code,
                host_id: userId,
                status: 'waiting',
                settings: { wind_direction: Math.random() * 360, wind_speed: 10 + Math.random() * 10 }
            })
            .select()
            .single();

        if (error || !lobby) {
            console.error('Error creating lobby:', error);
            return null;
        }

        // Add self as participant
        const { error: partError } = await supabase
            .from('race_participants')
            .insert({
                lobby_id: lobby.id,
                user_id: userId,
                username
            });

        if (partError) {
            console.error('Error joining own lobby:', partError);
            return null;
        }

        set({ lobby, playerId: userId, isHost: true });
        get().joinLobby(code, userId, username); // Re-use logic to subscribe
        return code;
    },

    joinLobby: async (code: string, userId: string, username: string) => {
        // 1. Fetch Lobby
        const { data: lobby, error } = await supabase
            .from('race_lobbies')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !lobby) {
            console.error('Lobby not found');
            return false;
        }

        // 2. Check if already participant, if not insert
        const { data: existing } = await supabase
            .from('race_participants')
            .select('*')
            .eq('lobby_id', lobby.id)
            .eq('user_id', userId)
            .single();

        if (!existing) {
             const { error: joinError } = await supabase
                .from('race_participants')
                .insert({
                    lobby_id: lobby.id,
                    user_id: userId,
                    username
                });

            if (joinError) {
                console.error('Error joining lobby:', joinError);
                return false;
            }
        }

        // 3. Subscribe to Realtime
        const channel = supabase.channel(`race_lobby:${lobby.id}`, {
            config: {
                broadcast: { self: false },
                presence: { key: userId },
            }
        });

        channel
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'race_lobbies',
                filter: `id=eq.${lobby.id}`
            }, (payload: RealtimePostgresChangesPayload<RaceLobby>) => {
                set({ lobby: payload.new as RaceLobby });
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'race_participants',
                filter: `lobby_id=eq.${lobby.id}`
            }, async () => {
                // Refresh participants list
                const { data: parts } = await supabase
                    .from('race_participants')
                    .select('*')
                    .eq('lobby_id', lobby.id);
                if (parts) set({ participants: parts });
            })
            .on('broadcast', { event: 'position_update' }, (payload: { payload: MultiplayerBoatState }) => {
                const update = payload.payload;
                set((state) => ({
                    opponents: {
                        ...state.opponents,
                        [update.userId]: update
                    }
                }));
            })
            .subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    // Initial fetch
                    const { data: parts } = await supabase
                        .from('race_participants')
                        .select('*')
                        .eq('lobby_id', lobby.id);

                    set({
                        lobby,
                        participants: parts || [],
                        channel,
                        playerId: userId,
                        isHost: lobby.host_id === userId
                    });
                }
            });

        return true;
    },

    leaveLobby: async () => {
        const { channel, lobby, playerId } = get();
        if (channel) await supabase.removeChannel(channel);

        // Optionally remove participant from DB if waiting
        if (lobby && lobby.status === 'waiting' && playerId) {
            await supabase
                .from('race_participants')
                .delete()
                .eq('lobby_id', lobby.id)
                .eq('user_id', playerId);
        }

        set({ lobby: null, participants: [], opponents: {}, channel: null, playerId: null, isHost: false });
    },

    startGame: async () => {
        const { lobby } = get();
        if (!lobby) return;

        await supabase
            .from('race_lobbies')
            .update({ status: 'starting' }) // or 'racing'
            .eq('id', lobby.id);

        // Trigger a countdown via broadcast? Or just rely on status change.
        // Status change to 'racing' is simpler.
        setTimeout(async () => {
             await supabase
                .from('race_lobbies')
                .update({ status: 'racing' })
                .eq('id', lobby.id);
        }, 5000); // 5s countdown
    },

    finishRace: async (score: number) => {
        const { lobby, playerId } = get();
        if (!lobby || !playerId) return;

        await supabase
            .from('race_participants')
            .update({
                score,
                finished_at: new Date().toISOString()
            })
            .eq('lobby_id', lobby.id)
            .eq('user_id', playerId);
    },

    broadcastPosition: (state) => {
        const { channel, playerId } = get();
        if (!channel || !playerId) return;

        channel.send({
            type: 'broadcast',
            event: 'position_update',
            payload: {
                ...state,
                userId: playerId,
                timestamp: Date.now()
            }
        });
    },

    reset: () => {
        const { channel } = get();
        if (channel) supabase.removeChannel(channel);
        set({ lobby: null, participants: [], opponents: {}, channel: null, playerId: null, isHost: false });
    }
}));
