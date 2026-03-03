import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		const body = await request.json();
		const { intento_id, respuestas } = body;

		if (!intento_id || !respuestas || typeof respuestas !== "object") {
			return NextResponse.json(
				{ error: "Faltan datos requeridos" },
				{ status: 400 },
			);
		}

		// Verificar ownership y estado en una sola query
		const { data: intento, error: intentoError } = await supabase
			.from("intentos_evaluacion")
			.select("id, estado")
			.eq("id", intento_id)
			.eq("alumno_id", user.id)
			.single();

		if (intentoError || !intento) {
			return NextResponse.json(
				{ error: "Intento no encontrado" },
				{ status: 404 },
			);
		}

		if (intento.estado !== "en_progreso") {
			// Silencioso: si ya fue completado, no es error, simplemente no guardamos
			return NextResponse.json({
				saved: false,
				reason: "attempt_not_in_progress",
			});
		}

		// MERGE de respuestas usando el operador || de JSONB
		// Preserva respuestas existentes, añade/actualiza las nuevas
		const now = new Date().toISOString();

		const { error: updateError } = await supabase.rpc(
			"merge_respuestas_autosave",
			{
				p_intento_id: intento_id,
				p_alumno_id: user.id,
				p_respuestas: respuestas,
				p_timestamp: now,
			},
		);

		if (updateError) {
			// Fallback: si la función RPC no existe, usar update directo
			// Esto es menos ideal porque reemplaza en vez de mergear,
			// pero es funcional como fallback
			const { data: intentoActual } = await supabase
				.from("intentos_evaluacion")
				.select("respuestas_json")
				.eq("id", intento_id)
				.single();

			const respuestasMerged = {
				...(intentoActual?.respuestas_json || {}),
				...respuestas,
			};

			const { error: fallbackError } = await supabase
				.from("intentos_evaluacion")
				.update({
					respuestas_json: respuestasMerged,
					ultima_actividad: now,
				})
				.eq("id", intento_id)
				.eq("alumno_id", user.id)
				.eq("estado", "en_progreso");

			if (fallbackError) {
				return NextResponse.json(
					{ error: fallbackError.message },
					{ status: 500 },
				);
			}
		}

		return NextResponse.json({ saved: true, timestamp: now });
	} catch (error) {
		console.error("Error en PATCH /api/academy/evaluation/autosave:", error);
		return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
	}
}

// POST handler: same as PATCH, needed for navigator.sendBeacon() which only sends POST
export async function POST(request: Request) {
	return PATCH(request);
}
