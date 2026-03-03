import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
	try {
		const supabase = createClient();

		// 1. Verify User
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. Claim Reward for any Completed, Unclaimed Active Challenge
		// We find the active challenge first to be specific
		const { data: challenge, error: challengeError } = await supabase.rpc(
			"get_or_create_weekly_challenge",
		);

		if (challengeError || !challenge) {
			return NextResponse.json(
				{ error: "No active challenge found" },
				{ status: 404 },
			);
		}

		// 3. Update Progress
		const { data, error } = await supabase
			.from("user_weekly_challenge_progress")
			.update({ reward_claimed: true })
			.eq("user_id", user.id)
			.eq("challenge_id", challenge.id)
			.eq("completed", true)
			.eq("reward_claimed", false)
			.select();

		if (error) {
			console.error("Error claiming reward:", error);
			return NextResponse.json(
				{ error: "Failed to claim reward" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, claimed: data.length > 0 });
	} catch (error) {
		console.error("Unexpected error in claim API:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
