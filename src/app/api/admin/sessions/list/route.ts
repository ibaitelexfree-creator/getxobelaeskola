import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";

export async function GET() {
	try {
		const { supabaseAdmin, error: authError } = await requireInstructor();
		if (authError) return authError;

		// Fetch sessions with joins
		const { data, error } = await supabaseAdmin
			.from("sesiones")
			.select(`
                *,
                curso:cursos(id, nombre_es, nombre_eu),
                instructor:profiles!sesiones_instructor_id_fkey(id, nombre, apellidos),
                embarcacion:embarcaciones(id, nombre),
                edits:session_edits(*)
            `)
			.order("fecha_inicio", { ascending: false });

		if (error) throw error;

		return NextResponse.json({ success: true, sessions: data });
	} catch (error: unknown) {
		const err = error as Error;
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
