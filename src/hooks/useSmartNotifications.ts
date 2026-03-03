'use client';

import { useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@/lib/supabase/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

export const useSmartNotifications = () => {
    const supabase = createClient();
    const { addNotification } = useNotificationStore();

    // --- Permissions ---
    const requestLocalPermissions = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const status = await LocalNotifications.checkPermissions();
            if (status.display !== 'granted') {
                await LocalNotifications.requestPermissions();
            }
        } catch (e) {
            console.error('Error requesting local notifications permissions', e);
        }
    }, []);

    // --- Streak Reminder (Based on study habits) ---
    const scheduleStreakReminder = useCallback(async (userId: string) => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            // Fetch last 30 days of quiz attempts to determine usual study time
            const { data: attempts } = await supabase
                .from('intentos_evaluacion')
                .select('created_at')
                .eq('alumno_id', userId)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

            if (!attempts || attempts.length === 0) return;

            // Calculate most frequent hour (mode)
            const hours = attempts.map((a: any) => new Date(a.created_at).getHours());
            if (hours.length === 0) return;

            const modeHour = hours.sort((a: number, b: number) =>
                hours.filter((v: number) => v === a).length - hours.filter((v: number) => v === b).length
            ).pop() || 18; // Default to 18:00 if calculation fails

            // Schedule notification for tomorrow at modeHour
            // We schedule it daily at this hour

            // Schedule ID 1001 for Streak
            await LocalNotifications.schedule({
                notifications: [{
                    title: '¡Es tu hora de estudiar! 📚',
                    body: 'Mantén tu racha activa y sigue aprendiendo.',
                    id: 1001,
                    schedule: { on: { hour: modeHour, minute: 0 }, allowWhileIdle: true },
                    smallIcon: 'ic_stat_icon_config_sample',
                }]
            });
            console.log(`Streak reminder scheduled for ${modeHour}:00`);

        } catch (e) {
            console.error('Error scheduling streak reminder', e);
        }
    }, [supabase]);

    // --- Exam Alert ---
    const scheduleExamReminders = useCallback(async (userId: string) => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const now = new Date().toISOString();
            // Fetch upcoming sessions where user is an attendee
            // Note: Join syntax depends on foreign key names. assuming 'sesiones' is the relation name from 'sesion_asistentes'
            const { data: attendance, error } = await supabase
                .from('sesion_asistentes')
                .select(`
                    sesion_id,
                    sesiones!inner (
                        fecha_inicio,
                        observaciones
                    )
                `)
                .eq('usuario_id', userId)
                .gt('sesiones.fecha_inicio', now);

            if (error) {
                console.error('Error fetching sessions for exam alert', error);
                return;
            }

            if (attendance) {
                for (const record of attendance) {
                    const session = record.sesiones as any; // Type assertion as inner join result
                    // Check if it's an exam: check 'observaciones'
                    // We rely on 'observaciones' containing 'examen'
                    const isExam = (session.observaciones && session.observaciones.toLowerCase().includes('examen'));

                    if (isExam) {
                        const examDate = new Date(session.fecha_inicio);
                        const reminderDate = new Date(examDate.getTime() - 24 * 60 * 60 * 1000); // 24h before

                        // Schedule only if reminder is in the future
                        if (reminderDate > new Date()) {
                            // Use session ID hash as notification ID to avoid collisions
                            const notifId = Math.abs(hashCode(record.sesion_id)) % 100000 + 2000;

                            await LocalNotifications.schedule({
                                notifications: [{
                                    title: '📅 ¡Examen Próximo!',
                                    body: `Tienes un examen mañana a las ${examDate.getHours()}:${examDate.getMinutes().toString().padStart(2, '0')}. ¡Prepárate!`,
                                    id: notifId,
                                    schedule: { at: reminderDate, allowWhileIdle: true },
                                    smallIcon: 'ic_stat_icon_config_sample',
                                }]
                            });
                            console.log(`Exam reminder scheduled for ${reminderDate.toISOString()}`);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error scheduling exam reminders', e);
        }

    }, [supabase]);

    // --- Module Completion Listener ---
    const listenToModuleCompletion = useCallback((userId: string) => {
        const channel = supabase
            .channel('smart_module_completion')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'progreso_alumno',
                    filter: `alumno_id=eq.${userId}`
                },
                async (payload: any) => {
                    const newData = payload.new as any;
                    // Check if status changed to 'completado' and it's a module
                    if (newData.estado === 'completado' && newData.tipo_entidad === 'modulo') {

                         const { data: moduleData } = await supabase
                            .from('modulos')
                            .select('nombre_es')
                            .eq('id', newData.entidad_id)
                            .single();

                         const moduleName = moduleData?.nombre_es || 'un módulo';

                         if (Capacitor.isNativePlatform()) {
                             try {
                                 await LocalNotifications.schedule({
                                     notifications: [{
                                         title: '¡Felicidades! 🎉',
                                         body: `Has completado ${moduleName}. ¡Sigue así!`,
                                         id: new Date().getTime() % 100000 + 3000,
                                         schedule: { at: new Date(Date.now() + 1000) } // Immediate
                                     }]
                                 });
                             } catch (e) {
                                 console.error('Error triggering local notification', e);
                             }
                         } else {
                             // Fallback for Web: In-app toast
                             addNotification({
                                 type: 'achievement',
                                 title: '¡Módulo Completado!',
                                 message: `Has completado ${moduleName}.`,
                                 icon: '🎓',
                                 duration: 5000
                             });
                         }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, addNotification]);

    return {
        requestLocalPermissions,
        scheduleStreakReminder,
        scheduleExamReminders,
        listenToModuleCompletion
    };
};

// Helper for simple hash
function hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
