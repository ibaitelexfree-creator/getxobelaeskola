
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
