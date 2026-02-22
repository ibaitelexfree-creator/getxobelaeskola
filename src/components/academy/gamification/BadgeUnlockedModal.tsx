'use client';

import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import confetti from 'canvas-confetti';

export default function BadgeUnlockedModal() {
    const notifications = useNotificationStore(state => state.notifications);
    const removeNotification = useNotificationStore(state => state.removeNotification);

    // Filter for 'badge' type notifications
    const badgeNotification = notifications.find(n => n.type === 'badge');

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (badgeNotification) {
            setIsVisible(true);

            // Trigger Confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ca8a04', '#fbbf24', '#ffffff']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ca8a04', '#fbbf24', '#ffffff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // Trigger Push Notification (via Capacitor if available)
            const triggerPush = async () => {
                try {
                    const { Capacitor } = await import('@capacitor/core');
                    const { PushNotifications } = await import('@capacitor/push-notifications');

                    if (Capacitor.isNativePlatform()) {
                        // Check if we have permission
                        const permStatus = await PushNotifications.checkPermissions();
                        if (permStatus.receive === 'granted') {
                            // Schedule a local notification (since we can't self-push easily without server setup)
                            // Actually, local-notifications is better for self-triggering.
                            // But prompt asked for FCM. If FCM is set up, a remote server would trigger it.
                            // Here we simulate it or use local notifications as a fallback.
                            // Let's try LocalNotifications plugin if available, otherwise just log.

                            const { LocalNotifications } = await import('@capacitor/local-notifications');
                            await LocalNotifications.schedule({
                                notifications: [{
                                    title: "¡Badge Desbloqueado!",
                                    body: `Has conseguido: ${badgeNotification.title}`,
                                    id: Math.floor(Math.random() * 10000),
                                    schedule: { at: new Date(Date.now() + 100) },
                                    sound: null,
                                    attachments: null,
                                    actionTypeId: "",
                                    extra: null
                                }]
                            });
                        }
                    } else if ('Notification' in window && Notification.permission === 'granted') {
                         new Notification("¡Badge Desbloqueado!", {
                             body: `Has conseguido: ${badgeNotification.title}`,
                             icon: '/favicon.ico' // fallback
                         });
                    }
                } catch (e) {
                    console.log('Notification trigger failed (this is expected in browser/sim without plugins):', e);
                }
            };

            triggerPush();
        } else {
            setIsVisible(false);
        }
    }, [badgeNotification]);

    if (!badgeNotification) return null;

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            removeNotification(badgeNotification.id);
        }, 300); // Wait for exit animation
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className={`
                relative bg-[#0a1628] border-2 border-accent
                w-full max-w-md rounded-3xl p-8 text-center
                shadow-[0_0_50px_rgba(202,138,4,0.3)]
                transform transition-all duration-500
                ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}
            `}>
                {/* Header Decoration */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-4xl shadow-lg ring-4 ring-[#0a1628] animate-bounce">
                        {badgeNotification.icon || '🏆'}
                    </div>
                </div>

                <div className="mt-10 space-y-4">
                    <h2 className="text-3xl font-display italic text-white">
                        ¡Enhorabuena!
                    </h2>

                    <div className="py-4">
                        <p className="text-accent text-sm font-bold uppercase tracking-widest mb-1">
                            Nuevo Badge Desbloqueado
                        </p>
                        <h3 className="text-2xl font-bold text-white">
                            {badgeNotification.title}
                        </h3>
                        <p className="text-white/60 mt-2 text-sm">
                            {badgeNotification.message}
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <button
                            onClick={handleClose}
                            className="px-8 py-3 bg-accent text-nautical-black font-bold rounded-xl hover:bg-white transition-colors"
                        >
                            Genial
                        </button>
                    </div>
                </div>

                {/* Confetti Canvas Container (handled by global canvas-confetti, but we can put a dedicated one if needed. Global is fine) */}
            </div>
        </div>
    );
}
