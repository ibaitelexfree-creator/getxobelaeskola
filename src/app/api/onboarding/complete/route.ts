import { NextResponse } from "next/server";
import { corsHeaders, withCors } from "@/lib/api-headers";
import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return new NextResponse(null, {
		status: 204,
		headers: corsHeaders(request),
	});
}

export async function POST(request: Request) {
	try {
		const authResult = await requireAuth();
		const { user, error, supabaseAdmin } = authResult;

		if (error || !user || !supabaseAdmin) {
			return withCors(
				NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
				request,
			);
		}

		const body = await request.json();
		const { meta_titulacion } = body;

		// 1. Update Profile (Using admin client to ensure we can update onboarding status)
		const { error: updateError } = await supabaseAdmin
			.from("profiles")
			.update({
				onboarding_completed: true,
				meta_titulacion: meta_titulacion || null,
			})
			.eq("id", user.id);

		if (updateError) {
			console.error("Error updating profile:", updateError);
			return withCors(
				NextResponse.json({ error: "Error updating profile" }, { status: 500 }),
				request,
			);
		}

		// 2. Award Badge
		// First find the badge ID
		const { data: badge } = await supabaseAdmin
			.from("logros")
			.select("id")
			.eq("slug", "marino-novel")
			.single();

		if (badge) {
			// Check if already awarded
			const { data: existingBadge } = await supabaseAdmin
				.from("logros_alumno")
				.select("id")
				.eq("alumno_id", user.id)
				.eq("logro_id", badge.id)
				.single();

			if (!existingBadge) {
				const { error: awardError } = await supabaseAdmin
					.from("logros_alumno")
					.insert({
						alumno_id: user.id,
						logro_id: badge.id,
					});

				if (awardError) {
					console.error("Error awarding badge:", awardError);
				}
			}
		}

		return withCors(NextResponse.json({ success: true }), request);
	} catch (err) {
		console.error("Error in onboarding complete:", err);
		return withCors(
			NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
			request,
		);
	}
}
