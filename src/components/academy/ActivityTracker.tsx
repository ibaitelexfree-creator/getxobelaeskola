'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { getStreakMessage } from '@/lib/academy/motivational-messages';

export default function ActivityTracker() {
    const supabase = createClient();
    const addNotification = useNotificationStore(state => state.addNotification);

    useEffect(() => {
        async function trackActivity() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Limit RPC calls to once per hour to avoid excessive database writes
                    // This improves performance by reducing redundant network requests and server load
                    const LAST_TRACK_KEY = `last_activity_track_${user.id}`;
                    const lastTrack = typeof window !== 'undefined' ? localStorage.getItem(LAST_TRACK_KEY) : null;
                    const now = Date.now();
                    const ONE_HOUR = 3600000;

                    if (lastTrack && now - parseInt(lastTrack) < ONE_HOUR) {
                        return;
                    }

                    // Llamar al RPC para registrar actividad diaria y rachas
                    try {
                        const { error: rpcError } = await supabase.rpc('registrar_actividad_alumno', { p_alumno_id: user.id });
                        if (rpcError) {
                            console.warn('Error calling registrar_actividad_alumno:', rpcError);
                        }
                    } catch (err) {
                        console.warn('Exception calling registrar_actividad_alumno (RPC might be missing):', err);
                    }

                    // Verificar racha actual para mensaje motivacional
                    try {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('current_streak')
                            .eq('id', user.id)
                            .single();

                        if (profileError) {
                            console.warn('Error fetching profile streak:', profileError);
                        } else if (profile?.current_streak) {
                            const streakMessage = getStreakMessage(profile.current_streak);
                            if (streakMessage) {
                                addNotification({
                                    type: 'info',
                                    title: '¡Racha en llamas! 🔥',
                                    message: streakMessage,
                                    icon: '🔥',
                                    duration: 5000
                                });
                            }
                        }
                    } catch (err) {
                        console.warn('Exception fetching profile streak:', err);
                    }

                    // Mark as tracked to prevent redundant calls in the next hour
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(LAST_TRACK_KEY, now.toString());
                    }
                }
            } catch (e) {
                console.error('Error in ActivityTracker:', e);
            }
        }

        trackActivity();
    }, [supabase, addNotification]);

    return null; // Componente invisible
}
