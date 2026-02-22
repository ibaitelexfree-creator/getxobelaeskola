import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const { user, error: authError } = await requireAuth();
		if (authError || !user)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const supabase = createClient();

		// 1. Get today's challenge
		// We can pick one based on the date so every user sees the same one
		const { data: challenges, error: challengeError } = await supabase
			.from("desafios_diarios")
			.select("*")
			.eq("activo", true);

		if (challengeError) throw challengeError;
		if (!challenges || challenges.length === 0) {
			return NextResponse.json(
				{ error: "No challenges found" },
				{ status: 404 },
			);
		}

		// Deterministic pick based on date
		const today = new Date().toISOString().split("T")[0];
		const seed = today.split("-").reduce((acc, val) => acc + parseInt(val), 0);
		const dailyChallenge = challenges[seed % challenges.length];

		// 2. Check if user already attempted today
		const { data: attempt, error: attemptError } = await supabase
			.from("intentos_desafios")
			.select("*")
			.eq("perfil_id", user.id)
			.eq("fecha", today)
			.maybeSingle();

		if (attemptError) throw attemptError;

		return NextResponse.json({
			challenge: {
				id: dailyChallenge.id,
				pregunta_es: dailyChallenge.pregunta_es,
				pregunta_eu: dailyChallenge.pregunta_eu,
				opciones: dailyChallenge.opciones,
				xp_recompensa: dailyChallenge.xp_recompensa,
				// Do NOT send the correct answer index in GET
			},
			completed: !!attempt,
			correct: attempt?.correcto || false,
			// If completed, we can send the response data
			result: attempt
				? {
						explicacion_es: dailyChallenge.explicacion_es,
						explicacion_eu: dailyChallenge.explicacion_eu,
						respuesta_correcta: dailyChallenge.respuesta_correcta,
					}
				: null,
		});
	} catch (err) {
		console.error("Error in daily challenge GET:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const { user, error: authError } = await requireAuth();
		if (authError || !user)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { desafioId, respuesta } = await req.json();

		if (!desafioId || respuesta === undefined) {
			return NextResponse.json({ error: "Missing data" }, { status: 400 });
		}

		const supabase = createClient();

		// Use the RPC to handle logic and XP atomicity
		const { data, error } = await supabase.rpc("completar_desafio_diario", {
			p_desafio_id: desafioId,
			p_respuesta: respuesta,
		});

		if (error) throw error;

		// If successful, also fetch the explanation
		if (data.success) {
			const { data: challenge } = await supabase
				.from("desafios_diarios")
				.select("explicacion_es, explicacion_eu, respuesta_correcta")
				.eq("id", desafioId)
				.single();

			return NextResponse.json({
				...data,
				explanation: challenge,
			});
		}

		return NextResponse.json(data);
	} catch (err) {
		console.error("Error in daily challenge POST:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
