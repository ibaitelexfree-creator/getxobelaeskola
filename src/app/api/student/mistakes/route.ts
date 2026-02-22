import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		// Fetch mistakes with question details
		const { data: mistakes, error } = await supabase
			.from("errores_repaso")
			.select(`
                *,
                pregunta:pregunta_id (
                    id,
                    enunciado_es,
                    enunciado_eu,
                    opciones_json,
                    respuesta_correcta,
                    explicacion_es,
                    explicacion_eu,
                    imagen_url,
                    tipo_pregunta
                )
            `)
			.eq("alumno_id", user.id)
			.eq("estado", "pendiente")
			.order("fecha_fallo", { ascending: false });

		if (error) {
			console.error("Error fetching mistakes:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ mistakes });
	} catch (err) {
		console.error("Unexpected error:", err);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
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
		const { pregunta_id } = body;

		if (!pregunta_id) {
			return NextResponse.json({ error: "Falta pregunta_id" }, { status: 400 });
		}

		const { error } = await supabase
			.from("errores_repaso")
			.update({
				estado: "dominada",
				fecha_repaso: new Date().toISOString(),
			})
			.eq("alumno_id", user.id)
			.eq("pregunta_id", pregunta_id);

		if (error) {
			console.error("Error marking mistake as mastered:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Unexpected error:", err);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
