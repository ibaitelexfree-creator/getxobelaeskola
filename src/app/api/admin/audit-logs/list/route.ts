import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";

export async function GET(request: Request) {
	try {
		const { supabaseAdmin, error: authError } = await requireInstructor();
		if (authError) return authError;

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "50");

		const { data: logs, error } = await supabaseAdmin
			.from("audit_logs")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) throw error;

		return NextResponse.json({ success: true, logs });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
