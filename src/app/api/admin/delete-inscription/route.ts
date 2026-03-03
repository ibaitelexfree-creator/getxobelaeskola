import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";

export async function POST(request: Request) {
	try {
		const { supabaseAdmin, error: authError } = await requireInstructor();
		if (authError) return authError;

		const body = await request.json();
		const { id } = body;

		if (!id)
			return NextResponse.json(
				{ error: "Falta ID de inscripción" },
				{ status: 400 },
			);

		const { error } = await supabaseAdmin
			.from("inscripciones")
			.delete()
			.eq("id", id);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: (err as Error).message },
			{ status: 500 },
		);
	}
}
