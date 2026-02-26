
import { createClient } from '@/lib/supabase/client';
import { MissionState, MissionStatus } from '@/components/academy/interactive-engine/types';

export interface SavedMissionProgress {
    currentStepId: string | null;
    score: number;
    status: MissionStatus;
    history: string[];
    updated_at: string;
}

export async function saveMissionProgress(
    userId: string,
    missionId: string,
    state: Partial<MissionState>
) {
    const supabase = createClient();

    const payload = {
        user_id: userId,
        mission_id: missionId,
        current_step_id: (state as any).currentStepId,
        score: state.score,
        status: state.status,
        history: (state as any).history ? JSON.stringify((state as any).history) : '[]',
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('mission_progress')
        .upsert(payload, { onConflict: 'user_id, mission_id' });

    if (error) {
        console.error('Error saving mission progress:', error);
        throw error;
    }
}

export async function getMissionProgress(
    userId: string,
    missionId: string
): Promise<SavedMissionProgress | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('mission_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching mission progress:', error);
        return null;
    }

    if (!data) return null;

    return {
        currentStepId: data.current_step_id,
        score: Number(data.score),
        status: data.status as MissionStatus,
        history: typeof data.history === 'string' ? JSON.parse(data.history) : data.history,
        updated_at: data.updated_at
    };
}
