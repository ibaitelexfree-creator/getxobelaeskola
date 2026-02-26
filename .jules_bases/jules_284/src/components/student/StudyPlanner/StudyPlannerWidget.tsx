'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudySession, StudyGoal } from './types';
import WeeklyCalendar from './WeeklyCalendar';
import SessionModal from './SessionModal';
import GoalProgress from './GoalProgress';
import { subMinutes } from 'date-fns';
import { Capacitor } from '@capacitor/core';

interface StudyPlannerWidgetProps {
    locale: string;
}

export default function StudyPlannerWidget({ locale }: StudyPlannerWidgetProps) {
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [goal, setGoal] = useState<StudyGoal | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal state
    const [modalDate, setModalDate] = useState<Date | undefined>(undefined);
    const [modalHour, setModalHour] = useState<number | undefined>(undefined);
    const [sessionToEdit, setSessionToEdit] = useState<StudySession | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Sessions
        const { data: sessionsData } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.id);

        if (sessionsData) setSessions(sessionsData);

        // Fetch Goal
        const { data: goalData } = await supabase
            .from('study_goals')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (goalData) setGoal(goalData);
    };

    const scheduleNotification = async (session: StudySession) => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');

            // Request permissions if needed
            const permStatus = await LocalNotifications.checkPermissions();
            if (permStatus.display !== 'granted') {
                const newStatus = await LocalNotifications.requestPermissions();
                if (newStatus.display !== 'granted') return;
            }

            // Calculate notification time (30 mins before)
            const startTime = new Date(session.start_time);
            const notifyTime = subMinutes(startTime, 30);

            if (notifyTime > new Date()) {
                 // Use a hash of the ID for notification ID (needs to be number)
                // Simple hash function for UUID to int
                let hash = 0;
                for (let i = 0; i < session.id.length; i++) {
                    hash = ((hash << 5) - hash) + session.id.charCodeAt(i);
                    hash |= 0;
                }
                const notifId = Math.abs(hash);

                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "¡Hora de estudiar! 📚",
                            body: `Tu sesión "${session.title}" comienza en 30 minutos.`,
                            id: notifId,
                            schedule: { at: notifyTime },
                            sound: undefined,
                            attachments: undefined,
                            actionTypeId: "",
                            extra: null
                        }
                    ]
                });
                console.log('Notification scheduled for', notifyTime);
            }
        } catch (e) {
            console.error('Error scheduling notification:', e);
        }
    };

    const cancelNotification = async (sessionId: string) => {
        if (!Capacitor.isNativePlatform()) return;

        try {
             const { LocalNotifications } = await import('@capacitor/local-notifications');

             let hash = 0;
             for (let i = 0; i < sessionId.length; i++) {
                 hash = ((hash << 5) - hash) + sessionId.charCodeAt(i);
                 hash |= 0;
             }
             const notifId = Math.abs(hash);

             await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
        } catch (e) {
             console.error('Error canceling notification:', e);
        }
    };

    const handleAddSession = (date: Date, hour: number) => {
        setSessionToEdit(null);
        setModalDate(date);
        setModalHour(hour);
        setIsModalOpen(true);
    };

    const handleEditSession = (session: StudySession) => {
        setSessionToEdit(session);
        setModalDate(undefined);
        setModalHour(undefined);
        setIsModalOpen(true);
    };

    const handleSaveSession = async (sessionData: Partial<StudySession>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (sessionData.id) {
            // Update
            const { data, error } = await supabase
                .from('study_sessions')
                .update({
                    title: sessionData.title,
                    start_time: sessionData.start_time,
                    end_time: sessionData.end_time,
                    completed: sessionData.completed
                })
                .eq('id', sessionData.id)
                .select()
                .single();

            if (!error && data) {
                setSessions(prev => prev.map(s => s.id === data.id ? data : s));
                // Reschedule notification
                await cancelNotification(data.id);
                await scheduleNotification(data);
            }
        } else {
            // Create
            const { data, error } = await supabase
                .from('study_sessions')
                .insert({
                    user_id: user.id,
                    title: sessionData.title,
                    start_time: sessionData.start_time,
                    end_time: sessionData.end_time
                })
                .select()
                .single();

            if (!error && data) {
                setSessions(prev => [...prev, data]);
                await scheduleNotification(data);
            }
        }
        setIsModalOpen(false);
    };

    const handleDeleteSession = async (sessionId: string) => {
        const { error } = await supabase
            .from('study_sessions')
            .delete()
            .eq('id', sessionId);

        if (!error) {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            await cancelNotification(sessionId);
            setIsModalOpen(false);
        }
    };

    const handleUpdateGoal = async (minutes: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('study_goals')
            .upsert({
                user_id: user.id,
                weekly_goal_minutes: minutes
            })
            .select()
            .single();

        if (!error && data) {
            setGoal(data);
        }
    };

    return (
        <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-accent font-bold">Planificador de Estudio</h2>
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1">
                    <WeeklyCalendar
                        sessions={sessions}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onAddSession={handleAddSession}
                        onEditSession={handleEditSession}
                        locale={locale}
                    />
                </div>
                <div className="w-full xl:w-72 shrink-0">
                    <GoalProgress
                        sessions={sessions}
                        goal={goal}
                        currentDate={currentDate}
                        onUpdateGoal={handleUpdateGoal}
                    />
                </div>
            </div>

            <SessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSession}
                onDelete={handleDeleteSession}
                initialDate={modalDate}
                initialHour={modalHour}
                sessionToEdit={sessionToEdit}
            />
        </section>
    );
}
