import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

		// 2. Get or Create Current Challenge (RPC ensures consistency)
		const { data: challenge, error: challengeError } = await supabase.rpc(
			"get_or_create_weekly_challenge",
		);

		if (challengeError) {
			console.error("Error fetching weekly challenge:", challengeError);
			return NextResponse.json(
				{ error: "Failed to fetch challenge" },
				{ status: 500 },
			);
		}

		if (!challenge) {
			return NextResponse.json({ challenge: null, progress: null });
		}

		// 3. Get User Progress for this Challenge
		const { data: progress, error: progressError } = await supabase
			.from("user_weekly_challenge_progress")
			.select("*")
			.eq("user_id", user.id)
			.eq("challenge_id", challenge.id)
			.maybeSingle(); // Use maybeSingle to avoid error if not found (though trigger/logic should handle it eventually, maybeSingle is safer)

		if (progressError) {
			console.error("Error fetching progress:", progressError);
			// We can still return the challenge even if progress fails
		}

		return NextResponse.json({
			challenge,
			progress: progress || null,
		});
	} catch (error) {
		console.error("Unexpected error in weekly challenge API:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
