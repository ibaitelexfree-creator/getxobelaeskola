import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { pregunta_id, contenido } = body;

		if (!pregunta_id || !contenido) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const { data: answer, error } = await supabase
			.from("foro_respuestas")
			.insert({
				pregunta_id,
				usuario_id: user.id,
				contenido,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating answer:", error);
			return NextResponse.json(
				{ error: "Error creating answer" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ answer });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
