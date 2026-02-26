import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InteractionResult } from '@/components/academy/montessori/types';
import { getAllTopics } from '@/components/academy/montessori/data-adapter';
import { updateAbility } from '@/lib/academy/montessori-ml';

interface Interaction {
    topicId: string;
    result: InteractionResult;
    timestamp: number;
}

interface MontessoriState {
    ability: number;
    history: Interaction[];
    recordInteraction: (topicId: string, result: InteractionResult) => void;
    resetProgress: () => void;
}

export const useMontessoriStore = create<MontessoriState>()(
    persist(
        (set, get) => ({
            ability: 0.5, // Start with average ability
            history: [],
            recordInteraction: (topicId: string, result: InteractionResult) => {
                const topics = getAllTopics();
                const topic = topics.find((t) => t.id === topicId);

                if (!topic) {
                    console.warn(`Topic with id ${topicId} not found.`);
                    return;
                }

                const currentAbility = get().ability;
                const newAbility = updateAbility(currentAbility, topic.difficulty, result);

                set((state) => ({
                    ability: newAbility,
                    history: [
                        ...state.history,
                        { topicId, result, timestamp: Date.now() },
                    ],
                }));
            },
            resetProgress: () => set({ ability: 0.5, history: [] }),
        }),
        {
            name: 'montessori-progress-storage',
        }
    )
);
