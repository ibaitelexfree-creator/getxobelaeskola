'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

export default function RealtimeNotifications() {
    const { addNotification } = useNotificationStore();
    const supabase = createClient();

    useEffect(() => {
        // 1. Obtener usuario actual para filtrar notificaciones
        async function setupRealtime() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Escuchar Logros
            const logrosSub = supabase
                .channel('realtime_logros')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'logros_alumno',
                        filter: `alumno_id=eq.${user.id}`
                    },
                    async (payload: { new: { logro_id: string } }) => {
                        // Obtener detalles del logro
                        const { data: logro } = await supabase
                            .from('logros')
                            .select('*')
                            .eq('id', payload.new.logro_id)
                            .single();

                        if (logro) {
                            addNotification({
                                type: 'achievement',
                                title: logro.nombre_es,
                                message: logro.descripcion_es,
                                icon: logro.icono || '🏆',
                                duration: 8000,
                                data: {
                                    rareza: logro.rareza,
                                    puntos: logro.puntos
                                }
                            });
                        }
                    }
                )
                .subscribe();

            // Escuchar Skills (Habilidades)
            const skillsSub = supabase
                .channel('realtime_skills')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'student_skills',
                        filter: `student_id=eq.${user.id}`
                    },
                    async (payload: { new: { skill_id: string } }) => {
                        // Obtener detalles de la skill
                        const { data: skill } = await supabase
                            .from('skills')
                            .select('*')
                            .eq('id', payload.new.skill_id)
                            .single();

                        if (skill) {
                            addNotification({
                                type: 'skill',
                                title: skill.name,
                                message: skill.description,
                                icon: skill.icon || '⚡',
                                duration: 0, // Manual close for skills
                                data: {
                                    category: skill.category
                                }
                            });
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(logrosSub);
                supabase.removeChannel(skillsSub);
            };
        }

        setupRealtime();
    }, [supabase, addNotification]);

    return null;
}
