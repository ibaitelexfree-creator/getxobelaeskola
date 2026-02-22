import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { fullName, email, dni, legalText, consentType, referenceId } = body;

		if (!fullName || !email || !dni || !legalText || !consentType) {
			return NextResponse.json(
				{ error: "Faltan campos obligatorios" },
				{ status: 400 },
			);
		}

		// Obtener IP del cliente
		const forwarded = req.headers.get("x-forwarded-for");
		const ip = forwarded ? forwarded.split(",")[0] : req.ip || "127.0.0.1";

		const supabase = createAdminClient();
		const serverSupabase = createServerClient();

		// Obtener usuario si está autenticado
		const {
			data: { user },
		} = await serverSupabase.auth.getUser();

		const { error } = await supabase.from("legal_consents").insert({
			user_id: user?.id || null,
			full_name: fullName,
			email: email,
			dni: dni,
			ip_address: ip,
			legal_text: legalText,
			consent_type: consentType,
			reference_id: referenceId || null,
		});

		if (error) {
			console.error("Error guardando consentimiento legal:", error);
			return NextResponse.json(
				{ error: "Error al guardar el consentimiento" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
