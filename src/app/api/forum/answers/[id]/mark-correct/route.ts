import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

	const { id } = params; // Answer ID

	try {
		// Check if user is staff
		const { data: isStaff, error: rpcError } = await supabase.rpc("es_staff");

		// Fallback to role check if RPC fails or not implemented
		let authorized = isStaff;
		if (rpcError || isStaff === null) {
			const { data: profile } = await supabase
				.from("profiles")
				.select("rol")
				.eq("id", user.id)
				.single();
			authorized = profile?.rol === "admin" || profile?.rol === "instructor";
		}

		if (!authorized) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Get the question_id of this answer
		const { data: answer } = await supabase
			.from("foro_respuestas")
			.select("pregunta_id, es_correcta")
			.eq("id", id)
			.single();

		if (!answer) {
			return NextResponse.json({ error: "Answer not found" }, { status: 404 });
		}

		const newStatus = !answer.es_correcta;

		if (newStatus) {
			// Unmark others
			await supabase
				.from("foro_respuestas")
				.update({ es_correcta: false })
				.eq("pregunta_id", answer.pregunta_id);
		}

		const { error } = await supabase
			.from("foro_respuestas")
			.update({ es_correcta: newStatus })
			.eq("id", id);

		if (error) {
			console.error("Error marking answer:", error);
			return NextResponse.json(
				{ error: "Error updating answer" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, es_correcta: newStatus });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
