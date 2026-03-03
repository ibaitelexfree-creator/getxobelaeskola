import { NextResponse } from "next/server";
import { requireInstructor } from "@/lib/auth-guard";

export async function POST(request: Request) {
	try {
		const { supabaseAdmin, error: authError } = await requireInstructor();
		if (authError) return authError;

		const body = await request.json();
		const { id, nombre, apellidos, rol, telefono } = body;

		if (!id)
			return NextResponse.json(
				{ error: "Falta ID de perfil" },
				{ status: 400 },
			);

		const { data, error } = await supabaseAdmin
			.from("profiles")
			.update({
				nombre,
				apellidos,
				rol,
				telefono,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json({ profile: data });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
