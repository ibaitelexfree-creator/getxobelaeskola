import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";

export async function GET(request: Request) {
	try {
		const { supabaseAdmin, error: authError } = await requireInstructor();
		if (authError) return authError;

		const { searchParams } = new URL(request.url);
		const start = searchParams.get("start");
		const end = searchParams.get("end");
		const excludeSessionId = searchParams.get("excludeSessionId");

		if (!start || !end) {
			return NextResponse.json(
				{ error: "Se requieren fechas de inicio y fin" },
				{ status: 400 },
			);
		}

		// Buscamos sesiones que se solapen con el rango dado
		// Un solape ocurre si: (Inicio1 < Fin2) Y (Fin1 > Inicio2)
		const { data: overlappingSessions, error: sessionError } =
			await supabaseAdmin
				.from("sesiones")
				.select(`
                id,
                embarcacion_id,
                fecha_inicio,
                fecha_fin,
                curso:cursos(nombre_es),
                instructor:profiles!sesiones_instructor_id_fkey(nombre, apellidos)
            `)
				.not("embarcacion_id", "is", null)
				.lt("fecha_inicio", end)
				.gt("fecha_fin", start);

		if (sessionError) throw sessionError;

		// Filtramos la sesión actual si se proporciona el ID
		const filteredSessions = excludeSessionId
			? overlappingSessions.filter((s) => s.id !== excludeSessionId)
			: overlappingSessions;

		// Mapeamos los IDs de embarcación a la información de la sesión que la ocupa
		const availability = (filteredSessions || []).reduce(
			(acc: Record<string, any>, session: any) => {
				if (session.embarcacion_id) {
					// Manejar tanto si es objeto como si es array (dependiendo de la relación en Supabase)
					const curso = Array.isArray(session.curso)
						? session.curso[0]
						: session.curso;
					const instructor = Array.isArray(session.instructor)
						? session.instructor[0]
						: session.instructor;

					acc[session.embarcacion_id] = {
						occupiedBy: curso?.nombre_es || "Sesión sin nombre",
						instructor: instructor
							? `${instructor.nombre} ${instructor.apellidos}`
							: "Sin instructor",
						start: session.fecha_inicio,
						end: session.fecha_fin,
					};
				}
				return acc;
			},
			{},
		);

		return NextResponse.json({ success: true, availability });
	} catch (error: unknown) {
		const err = error as Error;
		console.error("Error in boat availability API:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
