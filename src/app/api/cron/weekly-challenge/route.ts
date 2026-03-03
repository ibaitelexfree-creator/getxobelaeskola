import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get("authorization");
		const cronSecret = process.env.CRON_SECRET;

		// Allow if CRON_SECRET matches or if we are in development (localhost)
		// Vercel Cron jobs send the secret in the Authorization header
		const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
		const isDev = process.env.NODE_ENV === "development";

		if (!isCron && !isDev) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const supabase = createClient();

		// Call the RPC function to generate the challenge
		const { error } = await supabase.rpc("generate_weekly_challenge");

		if (error) {
			console.error("Error generating weekly challenge:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			timestamp: new Date().toISOString(),
			message: "Weekly challenge generation triggered successfully",
		});
	} catch (error: any) {
		console.error("Weekly challenge cron error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || "Internal Server Error",
			},
			{ status: 500 },
		);
	}
}
