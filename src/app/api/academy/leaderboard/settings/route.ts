import { NextResponse } from "next/server";
import { corsHeaders, withCors } from "@/lib/api-headers";
import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	const headers = corsHeaders(request);
	return new NextResponse(null, {
		status: 204,
		headers,
	});
}

export async function POST(request: Request) {
	try {
		const { user, error } = await requireAuth();
		if (error || !user) {
			return withCors(
				NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
				request,
			);
		}

		const { visibility } = await request.json();

		if (!["public", "anonymous", "private"].includes(visibility)) {
			return withCors(
				NextResponse.json(
					{ error: "Invalid visibility value" },
					{ status: 400 },
				),
				request,
			);
		}

		const supabase = createClient();
		const { error: dbError } = await supabase
			.from("profiles")
			.update({ leaderboard_visibility: visibility })
			.eq("id", user.id);

		if (dbError) {
			console.error("Update visibility error:", dbError);
			return withCors(
				NextResponse.json(
					{ error: "Error updating visibility" },
					{ status: 500 },
				),
				request,
			);
		}

		return withCors(NextResponse.json({ success: true, visibility }), request);
	} catch (err) {
		console.error("Internal Server Error:", err);
		return withCors(
			NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
			request,
		);
	}
}
