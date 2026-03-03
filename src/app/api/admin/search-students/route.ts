import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";

export async function GET(request: Request) {
	try {
		const { supabaseAdmin, error: authError } = await requireInstructor();
		if (authError) return authError;

		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q") || "";
		const { data: students, error } = await supabaseAdmin
			.from("profiles")
			.select("*")
			.or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%`)
			.limit(10);

		if (error) throw error;

		return NextResponse.json({ students });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
