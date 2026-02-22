import { NextResponse } from "next/server";
import {
	calculateDailySessions,
	type SessionEvent,
} from "@/lib/student/session-calculator";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 1. Fetch Progress (Modules visited & XP)
		const { data: progress, error: progressError } = await supabase
			.from("progreso_alumno")
			.select("updated_at, puntos_obtenidos, tipo_entidad, entidad_id")
			.eq("alumno_id", user.id)
			.order("updated_at", { ascending: false });

		if (progressError) throw progressError;

		// 2. Fetch Quiz Attempts (Questions answered)
		const { data: attempts, error: attemptsError } = await supabase
			.from("intentos_evaluacion")
			.select("created_at, fecha_completado, respuestas_json, puntos_obtenidos")
			.eq("alumno_id", user.id)
			.order("created_at", { ascending: false });

		if (attemptsError) throw attemptsError;

		// 3. Prepare Events for Calculation
		const events: SessionEvent[] = [];

		(progress || []).forEach((p) => {
			if (!p.updated_at) return;
			const timestamp = new Date(p.updated_at).getTime();

			const event: SessionEvent = {
				timestamp,
				type: "progress",
				xp: p.puntos_obtenidos || 0,
			};

			if (["modulo", "unidad", "curso"].includes(p.tipo_entidad)) {
				event.moduleId = `${p.tipo_entidad}_${p.entidad_id}`;
			}
			events.push(event);
		});

		(attempts || []).forEach((a) => {
			const dateVal = a.fecha_completado || a.created_at;
			if (!dateVal) return;
			const timestamp = new Date(dateVal).getTime();

			const event: SessionEvent = {
				timestamp,
				type: "attempt",
				// Note: We don't add XP here if it's already in progress, but if progress doesn't track it, we might need to.
				// Assuming progress tracks it. If not, we'd add xp: a.puntos_obtenidos
				questionCount:
					a.respuestas_json && typeof a.respuestas_json === "object"
						? Object.keys(a.respuestas_json).length
						: 0,
			};
			events.push(event);
		});

		// 4. Calculate Stats
		const result = calculateDailySessions(events);

		return NextResponse.json(result);
	} catch (error: any) {
		console.error("Error in study-sessions API:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}
