import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AcademyModeState {
    mode: 'structured' | 'exploration';
    setMode: (mode: 'structured' | 'exploration') => void;
    toggleMode: () => void;
}

export const useAcademyMode = create<AcademyModeState>()(
    persist(
        (set) => ({
            mode: 'structured',
            setMode: (mode) => set({ mode }),
            toggleMode: () => set((state) => ({
                mode: state.mode === 'structured' ? 'exploration' : 'structured'
            })),
        }),
        {
            name: 'academy-mode-storage',
        }
    )
);
