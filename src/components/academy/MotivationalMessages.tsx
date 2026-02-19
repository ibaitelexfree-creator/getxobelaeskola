'use client';

import React, { useState, useEffect } from 'react';

interface MotivationalMessagesProps {
    type: 'unit_completed' | 'quiz_passed' | 'quiz_failed' | 'streak' | 'level_up';
    context?: {
        streakDays?: number;
        score?: number;
        unitName?: string;
    };
}

export default function MotivationalMessages({ type, context }: MotivationalMessagesProps) {
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const selectedMessage = getMotivationalMessage(type, context);
        setMessage(selectedMessage);

        setTimeout(() => setIsVisible(true), 100);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 6000);

        return () => clearTimeout(timer);
    }, [type, context]);

    if (!message) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`
                fixed bottom-8 left-1/2 -translate-x-1/2 z-50
                transition-all duration-700 ease-out
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
            `}
        >
            <div className="bg-gradient-to-r from-accent/90 to-yellow-500/90 backdrop-blur-xl text-nautical-black px-8 py-4 rounded-2xl shadow-2xl shadow-accent/30 border-2 border-accent/50">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">{getEmoji(type)}</span>
                    <div>
                        <p className="font-display italic text-xl font-bold leading-tight">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getMotivationalMessage(type: string, context?: { streakDays?: number; score?: number; unitName?: string }): string {
    const messages: Record<string, string[]> = {
        unit_completed: [
            '¡Rumbo firme! Has completado esta etapa del viaje.',
            '¡Viento en popa! Una unidad más en tu bitácora.',
            '¡Excelente navegación! Sigues avanzando con destreza.',
            '¡Bravo, marinero! Tu conocimiento crece con cada milla.',
            'El mar de conocimiento se abre ante ti. ¡Adelante!'
        ],
        quiz_passed: [
            '¡Aprobado! Tu destreza náutica está en alza.',
            '¡Bien hecho! Cada acierto te acerca al horizonte.',
            '¡Navegación precisa! Has superado el desafío.',
            '¡Capitán en ciernes! Sigue este rumbo.',
            'Tu brújula mental funciona perfectamente. ¡Adelante!'
        ],
        quiz_failed: [
            'No pasa nada, el mar enseña con cada ola. Inténtalo de nuevo.',
            'Cada marinero ha tenido que virar. Ajusta las velas y vuelve.',
            'Una racha de viento en contra no detiene a un buen navegante.',
            'Aprende de este intento y zarpa de nuevo más fuerte.',
            'Hasta los mejores pilotos necesitan recalcular el rumbo.'
        ],
        streak: [
            `¡${context?.streakDays} días de racha! Tu constancia es tu mejor compás.`,
            `¡Increíble! ${context?.streakDays} días navegando sin parar.`,
            `Racha de ${context?.streakDays} días. ¡Eres imparable!`,
            'Tu disciplina es la vela que te impulsa cada día.',
            'Día tras día, te conviertes en un mejor navegante.'
        ],
        level_up: [
            '¡Nuevo nivel desbloqueado! El viento sopla a tu favor.',
            '¡Has ascendido! Nuevos horizontes te esperan.',
            '¡Promoción a bordo! Tu rango sube por mérito propio.',
            'De grumete a maestro, paso a paso. ¡Sigue así!',
            '¡Nivel superado! Tu viaje apenas comienza.'
        ]
    };

    const options = messages[type] || messages.unit_completed;
    return options[Math.floor(Math.random() * options.length)];
}

function getEmoji(type: string): string {
    const emojis: Record<string, string> = {
        unit_completed: '⚓',
        quiz_passed: '✨',
        quiz_failed: '🧭',
        streak: '🔥',
        level_up: '⛵'
    };
    return emojis[type] || '🌊';
}
