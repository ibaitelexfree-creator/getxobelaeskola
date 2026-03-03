import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";

export async function POST(request: Request) {
	try {
		const { supabaseAdmin, error: authError } = await requireInstructor();
		if (authError) return authError;

		const body = await request.json();
		const { id, estado_pago, log_seguimiento } = body;

		if (!id)
			return NextResponse.json(
				{ error: "Falta ID de inscripción" },
				{ status: 400 },
			);

		const updateData: Record<string, unknown> = {};
		if (estado_pago !== undefined) updateData.estado_pago = estado_pago;
		if (log_seguimiento) updateData.log_seguimiento = log_seguimiento;

		console.log("Updating Inscription:", { id, updateData });

		const { data, error } = await supabaseAdmin
			.from("inscripciones")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Supabase Update Error:", error);
			throw error;
		}

		return NextResponse.json({ inscription: data });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
