'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { calculateUsualStudyTime, getNextStudyReminderTime, getNotificationContent } from '@/lib/academy/notification-utils';
import { useLocale } from 'next-intl';

export default function SmartNotificationManager() {
    const supabase = createClient();
    const locale = useLocale();

    useEffect(() => {
        // Only run on native platforms (Android/iOS) to avoid browser permission spam or errors
        // although LocalNotifications works on web, we restrict to native as per "APK" requirement context
        if (!Capacitor.isNativePlatform()) return;

        const init = async () => {
            try {
                // Check permissions
                const permStatus = await LocalNotifications.checkPermissions();
                if (permStatus.display === 'prompt') {
                    await LocalNotifications.requestPermissions();
                }

                // Schedule daily streak reminder
                await scheduleStreakReminder();

                // Schedule exam alerts
                await scheduleExamAlerts();

                // Setup realtime listeners
                const channel = setupRealtimeListeners();

                return () => {
                    supabase.removeChannel(channel);
                };
            } catch (error) {
                console.error('SmartNotificationManager init error:', error);
            }
        };

        init();
    }, [supabase, locale]);

    const scheduleStreakReminder = async () => {
        try {
            // 1. Get user activity logs (intentos_evaluacion last 30 days)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: activity } = await supabase
                .from('intentos_evaluacion')
                .select('created_at')
                .eq('alumno_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            // Also get sessions attendance
            const { data: sessions } = await supabase
                .from('sesion_asistentes')
                .select('created_at')
                .eq('usuario_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            const activityDates = [
                ...(activity?.map(a => a.created_at) || []),
                ...(sessions?.map(s => s.created_at) || [])
            ];

            const usualHour = calculateUsualStudyTime(activityDates);
            const reminderTime = getNextStudyReminderTime(usualHour);

            // Check if streak reminder (ID: 1001) is already scheduled
            const pending = await LocalNotifications.getPending();
            const exists = pending.notifications.some(n => n.id === 1001);

            if (!exists) {
                const content = getNotificationContent('streak', locale);
                await LocalNotifications.schedule({
                    notifications: [{
                        id: 1001,
                        title: content.title,
                        body: content.body,
                        schedule: { at: reminderTime, repeats: true, every: 'day', allowWhileIdle: true }, // Schedule daily
                        smallIcon: 'ic_stat_notification', // Use default icon
                        extra: { type: 'streak' }
                    }]
                });
                console.log(`[SmartNotification] Streak reminder scheduled for ${reminderTime.toISOString()}`);
            }
        } catch (error) {
            console.error('[SmartNotification] Error scheduling streak reminder:', error);
        }
    };

    const scheduleExamAlerts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Find sessions where user is enrolled via sesion_asistentes
            // We need upcoming sessions. 'sesiones' table has 'fecha_inicio'.
            // Note: inner join filter on related table might be tricky in one query if RLS is strict,
            // but assuming standard Supabase query.
            const { data: upcomingSessions } = await supabase
                .from('sesion_asistentes')
                .select(`
                    sesion_id,
                    sesiones!inner(
                        id,
                        fecha_inicio,
                        curso_id,
                        cursos(nombre_es)
                    )
                `)
                .eq('usuario_id', user.id)
                .gte('sesiones.fecha_inicio', new Date().toISOString())
                .limit(10);

            if (upcomingSessions) {
                for (const item of upcomingSessions) {
                    // @ts-ignore
                    const session = item.sesiones;
                    if (!session) continue;

                    const sessionDate = new Date(session.fecha_inicio);

                    // Schedule 24h before
                    const alertTime = new Date(sessionDate.getTime() - 24 * 60 * 60 * 1000);

                    // Only schedule if it's in the future
                    if (alertTime > new Date()) {
                        // Generate a pseudo-unique ID for this session alert (using simple hash logic)
                        // Using 200000 + part of UUID to stay in int range
                        const uuidPart = parseInt(session.id.substring(0, 8), 16) % 100000;
                        const id = 200000 + uuidPart;

                        const pending = await LocalNotifications.getPending();
                        if (!pending.notifications.some(n => n.id === id)) {
                            const content = getNotificationContent('exam_soon', locale, { time: sessionDate.toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'}) });
                            await LocalNotifications.schedule({
                                notifications: [{
                                    id,
                                    title: content.title,
                                    body: content.body,
                                    schedule: { at: alertTime, allowWhileIdle: true },
                                    smallIcon: 'ic_stat_notification',
                                }]
                            });
                            console.log(`[SmartNotification] Exam alert scheduled for session ${session.id} at ${alertTime.toISOString()}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[SmartNotification] Error scheduling exam alerts:', error);
        }
    };

    const setupRealtimeListeners = () => {
        // Listen for module completion
        const channel = supabase
            .channel('smart-notifications-modules')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'progreso_alumno',
                    filter: `estado=eq.completado`
                },
                async (payload) => {
                    const { data: { user } } = await supabase.auth.getUser();

                    // Verify it's for the current user and it is a module
                    // Note: RLS ensures we only receive events we are allowed to see, but double checking user ID is safe.
                    if (user && payload.new.alumno_id === user.id && payload.new.tipo_entidad === 'modulo') {
                        // Fetch module name
                        const { data: modulo } = await supabase
                            .from('modulos')
                            .select('nombre_es, nombre_eu')
                            .eq('id', payload.new.entidad_id)
                            .single();

                        // @ts-ignore
                        const moduleName = locale === 'eu' ? modulo?.nombre_eu : modulo?.nombre_es;
                        const content = getNotificationContent('module_completed', locale, { moduleName: moduleName || 'Módulo' });

                        await LocalNotifications.schedule({
                            notifications: [{
                                id: Date.now() % 10000000, // Unique ID within int range
                                title: content.title,
                                body: content.body,
                                schedule: { at: new Date(Date.now() + 1000) }, // 1 sec delay
                                smallIcon: 'ic_stat_notification',
                            }]
                        });
                    }
                }
            )
            .subscribe();

        return channel;
    };

    return null;
}
