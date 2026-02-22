import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const supabaseAdmin = createAdminClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		// --- RATE LIMITING (Phase 5) ---
		// Limit: 10 start attempts per minute per user
		// This is separate from the "Business Logic" limits (3 attempts/day)
		const limitResult = rateLimit(user.id, 10, 60);
		if (!limitResult.success) {
			return NextResponse.json(
				{
					error: "Too Many Requests",
					retry_after: Math.ceil((limitResult.reset - Date.now()) / 1000),
				},
				{ status: 429 },
			);
		}
		// -------------------------------

		const body = await request.json();
		const { evaluacion_id } = body;

		if (!evaluacion_id) {
			return NextResponse.json(
				{ error: "Falta evaluacion_id" },
				{ status: 400 },
			);
		}

		// Obtener la evaluación con configuración
		const { data: evaluacion, error: evalError } = await supabase
			.from("evaluaciones")
			.select("*")
			.eq("id", evaluacion_id)
			.single();

		if (evalError || !evaluacion) {
			return NextResponse.json(
				{ error: "Evaluación no encontrada" },
				{ status: 404 },
			);
		}

		// --- HARDENING: VALIDAR PERMISOS (Fase 15) ---
		const tipoEntidadRpc = evaluacion.entidad_tipo;
		const { data: tieneAcceso, error: accessError } = await supabase.rpc(
			"puede_acceder_entidad",
			{
				p_alumno_id: user.id,
				p_tipo_entidad: tipoEntidadRpc,
				p_entidad_id: evaluacion.entidad_id,
			},
		);

		if (accessError) {
			console.error("Error verificando acceso:", accessError);
			return NextResponse.json(
				{ error: "Error verificando permisos de acceso." },
				{ status: 500 },
			);
		}

		if (!tieneAcceso) {
			return NextResponse.json(
				{
					error:
						"Acceso denegado: El contenido está bloqueado o no cumples los requisitos.",
					reason: "locked_content",
				},
				{ status: 403 },
			);
		}

		// --- HARDENING: VALIDAR PRERREQUISITOS DE LECTURA (Fase 15) ---
		if (evaluacion.tipo === "quiz_unidad") {
			const { data: progresoUnidad } = await supabase
				.from("progreso_alumno")
				.select("secciones_vistas")
				.eq("alumno_id", user.id)
				.eq("tipo_entidad", "unidad")
				.eq("entidad_id", evaluacion.entidad_id)
				.maybeSingle();

			const numSeccionesVistas = Array.isArray(progresoUnidad?.secciones_vistas)
				? progresoUnidad.secciones_vistas.length
				: 0;

			if (numSeccionesVistas < 3) {
				return NextResponse.json(
					{
						error:
							"Debes completar la lectura de todas las secciones antes de realizar el quiz.",
						reason: "readings_required",
						secciones_vistas: numSeccionesVistas,
						required: 3,
					},
					{ status: 403 },
				);
			}
		}

		const now = new Date();

		// 1. CHEQUEO DE INTENTO EN PROGRESO → REANUDAR o EXPIRAR
		const { data: intentoExistente, error: existenteError } = await supabase
			.from("intentos_evaluacion")
			.select("*")
			.eq("alumno_id", user.id)
			.eq("evaluacion_id", evaluacion_id)
			.eq("estado", "en_progreso")
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		if (existenteError) {
			return NextResponse.json(
				{ error: existenteError.message },
				{ status: 500 },
			);
		}

		if (intentoExistente) {
			const TTL_HORAS = 24;
			const ultimaActividad = new Date(
				intentoExistente.ultima_actividad || intentoExistente.created_at,
			);
			const horasInactivo =
				(now.getTime() - ultimaActividad.getTime()) / (1000 * 60 * 60);

			if (horasInactivo > TTL_HORAS) {
				await supabase
					.from("intentos_evaluacion")
					.update({
						estado: "abandonado",
						fecha_completado: new Date().toISOString(),
					})
					.eq("id", intentoExistente.id);
			} else {
				const { data: preguntas, error: preguntasError } = await supabaseAdmin
					.from("preguntas")
					.select(
						"id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, puntos, imagen_url",
					)
					.in("id", intentoExistente.preguntas_json);

				if (preguntasError) {
					return NextResponse.json(
						{ error: preguntasError.message },
						{ status: 500 },
					);
				}

				await supabase
					.from("intentos_evaluacion")
					.update({ ultima_actividad: new Date().toISOString() })
					.eq("id", intentoExistente.id);

				const ordenMap = new Map(
					(intentoExistente.preguntas_json as string[]).map(
						(id: string, i: number) => [id, i],
					),
				);
				const preguntasOrdenadas = preguntas.sort(
					(a: { id: string }, b: { id: string }) =>
						(ordenMap.get(a.id) ?? 0) - (ordenMap.get(b.id) ?? 0),
				);

				return NextResponse.json({
					allowed: true,
					resumed: true,
					intento: intentoExistente,
					evaluacion,
					preguntas: preguntasOrdenadas,
					respuestas_guardadas: intentoExistente.respuestas_json || {},
					tiempo_inicio:
						intentoExistente.fecha_inicio || intentoExistente.created_at,
				});
			}
		}

		// 2. CHEQUEO DE COOLDOWN Y LÍMITES
		const { data: ultimoIntentoData, error: ultimoError } = await supabase
			.from("intentos_evaluacion")
			.select("fecha_completado, created_at, estado, aprobado")
			.eq("alumno_id", user.id)
			.eq("evaluacion_id", evaluacion_id)
			.order("created_at", { ascending: false })
			.limit(1);

		if (ultimoError) {
			return NextResponse.json({ error: ultimoError.message }, { status: 500 });
		}

		const ultimoIntento =
			ultimoIntentoData && ultimoIntentoData.length > 0
				? ultimoIntentoData[0]
				: null;

		// A. COOLDOWN
		const cooldownMin = evaluacion.cooldown_minutos ?? 0;

		if (cooldownMin > 0 && ultimoIntento) {
			const lastTimeStr =
				ultimoIntento.fecha_completado || ultimoIntento.created_at;
			const lastTime = new Date(lastTimeStr);
			const cooldownMs = cooldownMin * 60 * 1000;
			const diff = now.getTime() - lastTime.getTime();

			if (diff < cooldownMs) {
				const remainingSeconds = Math.ceil((cooldownMs - diff) / 1000);
				return NextResponse.json({
					allowed: false,
					reason: "cooldown_active",
					retry_after_seconds: remainingSeconds,
				});
			}
		}

		// B. LÍMITE DE INTENTOS EN VENTANA DE TIEMPO
		const ventanaLimite = evaluacion.intentos_ventana_limite;
		const ventanaHoras = evaluacion.intentos_ventana_horas;

		if (ventanaLimite && ventanaHoras) {
			const windowMs = ventanaHoras * 60 * 60 * 1000;
			const windowStart = new Date(now.getTime() - windowMs);

			const { count: countVentana, error: countVentanaError } = await supabase
				.from("intentos_evaluacion")
				.select("*", { count: "exact", head: true })
				.eq("alumno_id", user.id)
				.eq("evaluacion_id", evaluacion_id)
				.gte("created_at", windowStart.toISOString())
				.neq("estado", "en_progreso");

			if (countVentanaError) {
				return NextResponse.json(
					{ error: countVentanaError.message },
					{ status: 500 },
				);
			}

			if (countVentana !== null && countVentana >= ventanaLimite) {
				const { data: intentosVentanaData, error: intentosVentanaError } =
					await supabase
						.from("intentos_evaluacion")
						.select("created_at")
						.eq("alumno_id", user.id)
						.eq("evaluacion_id", evaluacion_id)
						.gte("created_at", windowStart.toISOString())
						.neq("estado", "en_progreso")
						.order("created_at", { ascending: true })
						.limit(1);

				if (
					!intentosVentanaError &&
					intentosVentanaData &&
					intentosVentanaData.length > 0
				) {
					const oldestInWindow = intentosVentanaData[0];
					const oldestDate = new Date(oldestInWindow.created_at);
					const retryAt = new Date(oldestDate.getTime() + windowMs);
					const waitMs = retryAt.getTime() - now.getTime();
					const remainingSeconds = Math.ceil(waitMs / 1000);

					return NextResponse.json({
						allowed: false,
						reason: "max_attempts_window",
						retry_after_seconds: remainingSeconds > 0 ? remainingSeconds : 0,
					});
				} else {
					return NextResponse.json({
						allowed: false,
						reason: "max_attempts_window",
						retry_after_seconds: 60 * 60,
					});
				}
			}
		}

		// C. LÍMITE TOTAL
		if (evaluacion.intentos_maximos) {
			const { count: countTotal, error: countTotalError } = await supabase
				.from("intentos_evaluacion")
				.select("*", { count: "exact", head: true })
				.eq("alumno_id", user.id)
				.eq("evaluacion_id", evaluacion_id);

			if (countTotalError) {
				return NextResponse.json(
					{ error: countTotalError.message },
					{ status: 500 },
				);
			}

			if (countTotal !== null && countTotal >= evaluacion.intentos_maximos) {
				return NextResponse.json({
					allowed: false,
					reason: "max_attempts_total",
					retry_after_seconds: -1,
				});
			}
		}

		const { data: preguntasIds, error: preguntasError } = await supabase.rpc(
			"seleccionar_preguntas_evaluacion",
			{
				p_entidad_tipo: evaluacion.entidad_tipo,
				p_entidad_id: evaluacion.entidad_id,
				p_num_preguntas: evaluacion.num_preguntas,
			},
		);

		if (preguntasError) {
			return NextResponse.json(
				{ error: preguntasError.message },
				{ status: 500 },
			);
		}

		const { data: nuevoIntento, error: intentoError } = await supabase
			.from("intentos_evaluacion")
			.insert({
				alumno_id: user.id,
				evaluacion_id: evaluacion_id,
				tipo: evaluacion.tipo,
				preguntas_json: preguntasIds,
				respuestas_json: {},
				estado: "en_progreso",
			})
			.select()
			.single();

		let intento = nuevoIntento;

		if (intentoError) {
			if (intentoError.code === "23505") {
				const { data: intentoExistente, error: recoveryError } = await supabase
					.from("intentos_evaluacion")
					.select("*")
					.eq("alumno_id", user.id)
					.eq("evaluacion_id", evaluacion_id)
					.eq("estado", "en_progreso")
					.single();

				if (recoveryError || !intentoExistente) {
					return NextResponse.json(
						{ error: "Error recuperando intento existente" },
						{ status: 500 },
					);
				}

				intento = intentoExistente;

				const { data: preguntasExistentes, error: preguntasExistentesError } =
					await supabaseAdmin
						.from("preguntas")
						.select(
							"id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, puntos, imagen_url",
						)
						.in("id", intento.preguntas_json);

				if (preguntasExistentesError) {
					return NextResponse.json(
						{ error: preguntasExistentesError.message },
						{ status: 500 },
					);
				}

				const ordenMap = new Map(
					(intento.preguntas_json as string[]).map((id: string, i: number) => [
						id,
						i,
					]),
				);
				const preguntasOrdenadas = preguntasExistentes?.sort(
					(a: { id: string }, b: { id: string }) =>
						(ordenMap.get(a.id) ?? 0) - (ordenMap.get(b.id) ?? 0),
				);

				return NextResponse.json({
					allowed: true,
					resumed: true,
					intento: intento,
					evaluacion,
					preguntas: preguntasOrdenadas || [],
					respuestas_guardadas: intento.respuestas_json || {},
					tiempo_inicio: intento.fecha_inicio || intento.created_at,
				});
			} else {
				return NextResponse.json(
					{ error: intentoError.message },
					{ status: 500 },
				);
			}
		}

		const { data: preguntas, error: preguntasDataError } = await supabaseAdmin
			.from("preguntas")
			.select(
				"id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, puntos, imagen_url",
			)
			.in("id", preguntasIds);

		if (preguntasDataError) {
			return NextResponse.json(
				{ error: preguntasDataError.message },
				{ status: 500 },
			);
		}

		let preguntasOrdenadas = preguntas;
		if (evaluacion.aleatorizar_preguntas) {
			preguntasOrdenadas = preguntas.sort(() => Math.random() - 0.5);
		}

		return NextResponse.json({
			allowed: true,
			intento,
			evaluacion,
			preguntas: preguntasOrdenadas,
			tiempo_inicio: new Date().toISOString(),
		});
	} catch {
		return NextResponse.json(
			{ error: "Error al iniciar evaluación" },
			{ status: 500 },
		);
	}
}
