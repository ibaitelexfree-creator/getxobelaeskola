import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const supabase = createClient();
	const { id } = params;

	try {
		const { data: question, error } = await supabase
			.from("foro_preguntas")
			.select(`
                *,
                profiles:usuario_id (
                    nombre,
                    apellidos,
                    avatar_url,
                    rol
                ),
                foro_respuestas (
                    id,
                    contenido,
                    votos,
                    es_correcta,
                    created_at,
                    usuario_id,
                    profiles:usuario_id (
                        nombre,
                        apellidos,
                        avatar_url,
                        rol
                    )
                )
            `)
			.eq("id", id)
			.order("created_at", { foreignTable: "foro_respuestas", ascending: true })
			.single();

		if (error) {
			console.error("Error fetching question:", error);
			return NextResponse.json(
				{ error: "Question not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ question });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = params;

	try {
		// Check if user is owner or staff
		const { data: question } = await supabase
			.from("foro_preguntas")
			.select("usuario_id")
			.eq("id", id)
			.single();

		if (!question) {
			return NextResponse.json(
				{ error: "Question not found" },
				{ status: 404 },
			);
		}

		// Check if user is staff
		const { data: profile } = await supabase
			.from("profiles")
			.select("rol")
			.eq("id", user.id)
			.single();

		const isStaff = profile?.rol === "admin" || profile?.rol === "instructor";

		if (question.usuario_id !== user.id && !isStaff) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { error } = await supabase
			.from("foro_preguntas")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("Error deleting question:", error);
			return NextResponse.json(
				{ error: "Error deleting question" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
