'use client';

import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import confetti from 'canvas-confetti';

export default function AchievementToast() {
    const notifications = useNotificationStore(state => state.notifications);
    const removeNotification = useNotificationStore(state => state.removeNotification);

    const achievementNotifications = notifications
        .filter(n => n.type === 'achievement')
        .slice(-3); // Mostrar solo los últimos 3 logros para no saturar la pantalla

    return (
        <div className="fixed top-20 right-6 z-50 space-y-4 pointer-events-none">
            {achievementNotifications.map((notification, index) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    index={index}
                    onDismiss={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
}

interface ToastProps {
    notification: {
        id: string;
        type: string;
        title: string;
        message: string;
        icon?: string;
        duration?: number;
        data?: {
            rareza?: string;
            puntos?: number;
        };
    };
    index: number;
    onDismiss: () => void;
}

function Toast({ notification, index, onDismiss }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Staggered entry animation based on index
        const entryDelay = 50 + (index * 150);
        setTimeout(() => {
            setIsVisible(true);
            // Trigger confetti animation
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999,
                colors: ['#FFD700', '#FFA500', '#FFFFFF', '#00BFFF']
            });
        }, entryDelay);

        // Auto-dismiss
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onDismiss, 500);
        }, (notification.duration || 5000) + entryDelay);

        return () => clearTimeout(timer);
    }, [notification.duration, onDismiss, index]);

    const rarityColors: Record<string, string> = {
        legendario: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]',
        epico: 'from-purple-500/20 to-pink-500/20 border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]',
        raro: 'from-blue-500/20 to-cyan-500/20 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        comun: 'from-white/10 to-white/5 border-white/20'
    };

    const rarity = notification.data?.rareza || 'comun';
    const colorClass = rarityColors[rarity] || rarityColors.comun;

    return (
        <div
            role="alert"
            aria-live="polite"
            aria-label={`Logro desbloqueado: ${notification.title}`}
            tabIndex={0}
            className={`
                pointer-events-auto
                relative overflow-hidden
                bg-gradient-to-br ${colorClass}
                backdrop-blur-xl
                border-2 rounded-2xl
                p-5 min-w-[320px] max-w-md
                transition-all duration-500 ease-out
                motion-reduce:transition-none motion-reduce:transform-none
                cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400/50
                ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
            onClick={onDismiss}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onDismiss();
                }
            }}
        >
            {/* Background sparkles - Hidden on reduced motion */}
            <div className="absolute inset-0 pointer-events-none motion-reduce:hidden">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse motion-reduce:animate-none"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.6
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/30 motion-safe:animate-bounce-slow">
                    {notification.icon || '🏆'}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <div className="text-3xs uppercase font-black tracking-widest text-yellow-400 mb-1">
                        ¡Logro Desbloqueado!
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1 leading-tight">
                        {notification.title}
                    </h4>
                    <p className="text-white/70 text-sm leading-snug">
                        {notification.message}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`text-2xs font-black uppercase px-2 py-0.5 rounded-full ${rarity === 'legendario' ? 'bg-yellow-500/30 text-yellow-300' :
                            rarity === 'epico' ? 'bg-purple-500/30 text-purple-300' :
                                rarity === 'raro' ? 'bg-blue-500/30 text-blue-300' :
                                    'bg-white/20 text-white/60'
                            }`}>
                            {rarity}
                        </span>
                        {notification.data?.puntos && (
                            <span className="text-2xs font-bold text-yellow-400">
                                +{notification.data.puntos} PTS
                            </span>
                        )}
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss();
                    }}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-600 motion-safe:animate-progress-bar"
                    style={{ animationDuration: `${notification.duration || 5000}ms` }}
                />
            </div>
        </div>
    );
}
