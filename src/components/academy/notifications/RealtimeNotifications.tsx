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
                    async (payload: any) => {
                        // Obtener detalles del logro
                        const { data: logro } = await supabase
                            .from('logros')
                            .select('*')
                            .eq('id', payload.new.logro_id)
                            .single();

                        if (logro) {
                            addNotification({
                                type: 'achievement' as any,
                                title: logro.nombre_es,
                                message: logro.descripcion_es,
                                icon: logro.icono || '🏆',
                                duration: 16000,
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
                    async (payload: any) => {
                        // Obtener detalles de la skill
                        const { data: skill } = await supabase
                            .from('skills')
                            .select('*')
                            .eq('id', payload.new.skill_id)
                            .single();

                        if (skill) {
                            addNotification({
                                type: 'skill' as any,
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

            // Escuchar Feedback del Instructor
            const feedbackSub = supabase
                .channel('realtime_feedback')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'instructor_feedback',
                        filter: `student_id=eq.${user.id}`
                    },
                    (payload: any) => {
                        const newFeedback = payload.new;
                        const contextTitle = newFeedback.context_type === 'logbook' ? 'Bitácora' : 'Evaluación';

                        addNotification({
                            type: 'info' as any,
                            title: 'Nuevo Feedback',
                            message: `Tu instructor ha comentado en tu ${contextTitle}.`,
                            icon: '💬',
                            duration: 8000,
                            data: {
                                context_id: newFeedback.context_id,
                                context_type: newFeedback.context_type
                            }
                        });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(logrosSub);
                supabase.removeChannel(skillsSub);
                supabase.removeChannel(feedbackSub);
            };
        }

        setupRealtime();
    }, [supabase, addNotification]);

    return null;
}
