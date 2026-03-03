import type {
	BranchingMissionData,
	MissionProgress,
	MissionStep,
} from "@/components/academy/interactive-engine/types";
import { createClient } from "@/lib/supabase/client";

/**
 * Fetch a mission by its slug, including all steps.
 * Note: This assumes the mission_steps table has a FK to missions.
 */
export async function getMissionBySlug(
	slug: string,
): Promise<BranchingMissionData | null> {
	const supabase = createClient();

	// We fetch the mission and join the steps.
	// Assuming the foreign key name is standard or handled by PostgREST
	const { data: mission, error } = await supabase
		.from("missions")
		.select(`
            *,
            steps:mission_steps(*)
        `)
		.eq("slug", slug)
		.single();

	if (error) {
		console.error("Error fetching mission:", error);
		return null;
	}

	if (!mission) return null;

	// Map DB response to BranchingMissionData
	// We need to cast types or map fields if names differ
	const steps = (mission.steps || []) as MissionStep[];

	// Sort steps by position just in case
	steps.sort((a, b) => (a.position || 0) - (b.position || 0));

	return {
		...mission,
		tipo_contenido: "interactive_branching",
		titulo: mission.title,
		descripcion: mission.description,
		steps: steps,
	} as BranchingMissionData;
}

/**
 * Fetch user progress for a specific mission.
 */
export async function getUserProgress(
	missionId: string,
	userId: string,
): Promise<MissionProgress | null> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("mission_progress")
		.select("*")
		.eq("mission_id", missionId)
		.eq("user_id", userId)
		.maybeSingle();

	if (error) {
		console.error("Error fetching progress:", error);
		return null;
	}

	return data as MissionProgress;
}

/**
 * Save or Update user progress.
 */
export async function saveUserProgress(
	progress: Partial<MissionProgress> & { mission_id: string; user_id: string },
): Promise<MissionProgress | null> {
	const supabase = createClient();

	// Upsert based on unique constraint (user_id, mission_id)
	const { data, error } = await supabase
		.from("mission_progress")
		.upsert(
			{
				...progress,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "user_id, mission_id" },
		)
		.select()
		.single();

	if (error) {
		console.error("Error saving progress:", error);
		return null;
	}

	return data as MissionProgress;
}
