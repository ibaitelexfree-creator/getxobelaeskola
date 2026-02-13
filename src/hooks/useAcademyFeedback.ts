'use client';

import { useRef, useState, useEffect } from 'react';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

interface AchievementData {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu?: string;
    icono: string;
    rareza: 'comun' | 'raro' | 'epico' | 'legendario';
    puntos: number;
}

interface SkillData {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

export function useAcademyFeedback() {
    const addNotification = useNotificationStore(state => state.addNotification);
    const lastAchievementId = useRef<string | null>(null);
    const lastSkillId = useRef<string | null>(null);

    // Show achievement toast
    const showAchievement = (achievement: AchievementData, locale: string = 'es') => {
        // Prevent duplicate notifications
        if (lastAchievementId.current === achievement.id) return;
        lastAchievementId.current = achievement.id;

        addNotification({
            type: 'achievement',
            title: locale === 'eu' ? achievement.nombre_eu : achievement.nombre_es,
            message: (locale === 'eu' && achievement.descripcion_eu) ? achievement.descripcion_eu : achievement.descripcion_es,
            icon: achievement.icono,
            duration: 6000,
            data: {
                rareza: achievement.rareza,
                puntos: achievement.puntos
            }
        });
    };

    // Show skill unlocked modal
    const showSkillUnlocked = (skill: SkillData) => {
        // Prevent duplicate notifications
        if (lastSkillId.current === skill.id) return;
        lastSkillId.current = skill.id;

        addNotification({
            type: 'skill',
            title: skill.name,
            message: skill.description,
            icon: skill.icon,
            duration: 0, // Manual close
            data: {
                category: skill.category
            }
        });
    };

    // Show generic success/info message
    const showMessage = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'success', icon?: string) => {
        addNotification({
            type,
            title,
            message,
            icon,
            duration: 4000
        });
    };

    // Check for new achievements (called after unit completion, quiz submission, etc.)
    const checkForNewAchievements = async () => {
        try {
            const response = await fetch('/api/academy/achievements');
            const newAchievements: AchievementData[] = await response.json();

            // Get previous achievements from localStorage
            const stored = localStorage.getItem('sailing_achievements');
            const prevIds: string[] = stored ? JSON.parse(stored) : [];

            // Find new unlocked achievements
            const unlocked = newAchievements.filter(a => !prevIds.includes(a.id));

            // Trigger notifications for new ones
            unlocked.forEach(achievement => {
                showAchievement(achievement);
            });

            // Update localStorage with current list of IDs
            const currentIds = newAchievements.map(a => a.id);
            localStorage.setItem('sailing_achievements', JSON.stringify(currentIds));

        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    };

    return {
        showAchievement,
        showSkillUnlocked,
        showMessage,
        checkForNewAchievements
    };
}

// Helper to get user preferences
export function useAnimationPreferences() {
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    // Initial load
    useEffect(() => {
        const stored = localStorage.getItem('animations_enabled');
        if (stored !== null) setAnimationsEnabled(stored === 'true');
    }, []);

    const toggleAnimations = async () => {
        const newState = !animationsEnabled;
        setAnimationsEnabled(newState); // Optimistic update
        localStorage.setItem('animations_enabled', String(newState));

        try {
            await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ animations_enabled: newState })
            });
        } catch (error) {
            console.error('Error saving animation preference:', error);
            // Revert on error
            setAnimationsEnabled(!newState);
            localStorage.setItem('animations_enabled', String(!newState));
        }
    };

    return {
        animationsEnabled,
        toggleAnimations
    };
}
