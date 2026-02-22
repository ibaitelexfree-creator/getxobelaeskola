import { NextResponse } from "next/server";
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

		const body = await request.json();
		const { answers } = body; // Record<string, string>

		if (!answers) {
			return NextResponse.json({ error: "Faltan respuestas" }, { status: 400 });
		}

		const questionIds = Object.keys(answers);

		if (questionIds.length === 0) {
			return NextResponse.json({
				puntuacion: 0,
				aprobado: false,
				detalles: [],
				correctas: 0,
				total: 0,
			});
		}

		// Fetch correct answers
		const { data: correctData, error: fetchError } = await supabaseAdmin
			.from("preguntas")
			.select("id, respuesta_correcta, explicacion_es, explicacion_eu, puntos")
			.in("id", questionIds);

		if (fetchError) {
			console.error("Error fetching correct answers:", fetchError);
			return NextResponse.json(
				{ error: "Error al verificar respuestas" },
				{ status: 500 },
			);
		}

		// Calculate score
		let totalPoints = 0;
		let earnedPoints = 0;
		let correctCount = 0;

		const details = correctData?.map((q) => {
			const userAnswer = answers[q.id];
			const isCorrect = userAnswer === q.respuesta_correcta;

			if (isCorrect) {
				earnedPoints += q.puntos || 1;
				correctCount++;
			}
			totalPoints += q.puntos || 1;

			return {
				questionId: q.id,
				userAnswer,
				correctAnswer: q.respuesta_correcta,
				isCorrect,
				explicacion_es: q.explicacion_es,
				explicacion_eu: q.explicacion_eu,
			};
		});

		// PER Grading Logic (Simplified for now: 70% to pass)
		// Standard PER is 45 questions, max 5 errors allowed in general?
		// Actually PER has specific block rules.
		// Since we don't have block data easily, we'll use a 70% threshold.
		// 60 questions -> 42 correct to pass.

		const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
		const passed = score >= 70;

		return NextResponse.json({
			puntuacion: Math.round(score),
			puntos_obtenidos: earnedPoints,
			puntos_totales: totalPoints,
			aprobado: passed,
			detalles: details,
			correctas: correctCount,
			total: questionIds.length,
		});
	} catch (error) {
		console.error("Error en simulación submit:", error);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
