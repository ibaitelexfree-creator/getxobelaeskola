<<<<<<< HEAD

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AlertRecord {
    id: string;
    timestamp: string;
    title: string;
    message: string;
    type: 'critical' | 'warning';
}

interface SafetySettingsState {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    alertHistory: AlertRecord[];
    setNotificationsEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
    addAlertToHistory: (alert: Omit<AlertRecord, 'id' | 'timestamp'>) => void;
    clearAlertHistory: () => void;
}

export const useSafetySettingsStore = create<SafetySettingsState>()(
    persist(
        (set) => ({
            notificationsEnabled: true,
            soundEnabled: false,
            alertHistory: [],
            setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            addAlertToHistory: (alert) => set((state) => {
                const newAlert: AlertRecord = {
                    ...alert,
                    id: Math.random().toString(36).substring(2, 9),
                    timestamp: new Date().toISOString(),
                };
                return {
                    alertHistory: [newAlert, ...state.alertHistory].slice(0, 50)
                };
            }),
            clearAlertHistory: () => set({ alertHistory: [] }),
        }),
        {
            name: 'safety-settings-storage',
        }
    )
);
=======

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SafetySettingsState {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
}

export const useSafetySettingsStore = create<SafetySettingsState>()(
    persist(
        (set) => ({
            notificationsEnabled: true,
            soundEnabled: false, // Default off as requested (active notifications by default but sound optional/customizable)
            setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
        }),
        {
            name: 'safety-settings-storage',
        }
    )
);
>>>>>>> pr-286
