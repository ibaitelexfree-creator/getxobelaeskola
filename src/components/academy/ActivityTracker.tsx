'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { getStreakMessage } from '@/lib/academy/motivational-messages';

export default function ActivityTracker() {
    const supabase = createClient();
    const addNotification = useNotificationStore(state => state.addNotification);
    const { user, profile } = useUserStore();

    useEffect(() => {
        async function trackActivity() {
            if (!user) return;

            try {
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
                if (profile?.current_streak) {
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
            } catch (e) {
                console.error('Error in ActivityTracker:', e);
            }
        }

        trackActivity();
    }, [user, profile?.current_streak, supabase, addNotification]);

    return null; // Componente invisible
}
