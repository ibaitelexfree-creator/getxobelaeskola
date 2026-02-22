import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Check Instructor Role
	const { data: profile } = await supabase
		.from("profiles")
		.select("rol")
		.eq("id", user.id)
		.single();

	const isInstructor =
		profile?.rol === "admin" || profile?.rol === "instructor";

	if (!isInstructor) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const studentId = searchParams.get("student_id");

	if (!studentId) {
		return NextResponse.json({ error: "student_id required" }, { status: 400 });
	}

	try {
		// Fetch Diary Entries
		const { data: diary } = await supabase
			.from("bitacora_personal")
			.select("*")
			.eq("alumno_id", studentId)
			.order("fecha", { ascending: false });

		// Fetch Evaluations
		const { data: evaluations } = await supabase
			.from("intentos_evaluacion")
			.select(`
                *,
                evaluacion:evaluacion_id (
                    titulo_es,
                    titulo_eu,
                    tipo,
                    nota_aprobado
                )
            `)
			.eq("alumno_id", studentId)
			.order("created_at", { ascending: false });

		// Fetch Existing Feedback for this student
		const { data: feedback } = await supabase
			.from("instructor_feedback")
			.select("*")
			.eq("student_id", studentId);

		return NextResponse.json({
			diary: diary || [],
			evaluations: evaluations || [],
			feedback: feedback || [],
		});
	} catch (error) {
		console.error("Error fetching student logbook:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
