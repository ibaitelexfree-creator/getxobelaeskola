import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";
import { listGoogleEvents } from "@/lib/google-calendar";

export async function GET(request: Request) {
	try {
		const { error: authError } = await requireInstructor();
		if (authError) return authError;

		const { searchParams } = new URL(request.url);
		const timeMin = searchParams.get("timeMin");
		const timeMax = searchParams.get("timeMax");

		// Default window: -1 month to +6 months if not specified
		const defaultMin = new Date();
		defaultMin.setMonth(defaultMin.getMonth() - 1);

		const defaultMax = new Date();
		defaultMax.setMonth(defaultMax.getMonth() + 6);

		const events = await listGoogleEvents(
			timeMin || defaultMin.toISOString(),
			timeMax || defaultMax.toISOString(),
		);

		return NextResponse.json({ success: true, events });
	} catch (error: unknown) {
		const err = error as Error;
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
