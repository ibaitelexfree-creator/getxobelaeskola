import { NextResponse } from "next/server";
import { DEFAULT_FROM_EMAIL, resend } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

/**
 * API interna para envío de correos.
 * Protegida: requiere ser Staff o tener un API_SECRET_KEY (opcional para webhooks externos si se desea)
 */
/**
 * API interna para envío de correos.
 * Protegida: requiere ser Staff/Admin O tener un X-API-KEY válido.
 */
export async function POST(request: Request) {
	try {
		const apiKey = request.headers.get("x-api-key");
		const systemSecret = process.env.INTERNAL_API_SECRET || "getxo-secret-2024"; // Fallback for dev

		let authorized = false;

		// 1. Check if it's a server-to-server call with valid API Key
		if (apiKey === systemSecret) {
			authorized = true;
		}

		// 2. If not authorized by key, check for Staff/Admin session
		if (!authorized) {
			const supabase = await createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("rol")
					.eq("id", user.id)
					.single();

				if (profile?.rol === "admin" || profile?.rol === "instructor") {
					authorized = true;
				}
			}
		}

		if (!authorized) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const body = await request.json();
		const { to, subject, html, text, fromName } = body;

		// Basic Validation
		if (!to || !subject || (!html && !text)) {
			return NextResponse.json(
				{ error: "Faltan campos requeridos (to, subject, content)" },
				{ status: 400 },
			);
		}

		if (!resend) {
			console.log("--- SIMULACIÓN EMAIL ---");
			console.log(`To: ${to}`);
			console.log(`Subject: ${subject}`);
			console.log("--- FIN SIMULACIÓN ---");
			return NextResponse.json({
				success: true,
				simulated: true,
				message: "Modo simulación: RESEND_API_KEY no configurada",
			});
		}

		const fromString = fromName
			? `${fromName} <${DEFAULT_FROM_EMAIL}>`
			: DEFAULT_FROM_EMAIL;

		const { data, error } = await resend.emails.send({
			from: fromString,
			to,
			subject,
			html: html || text,
			text: text || html,
		});

		if (error) {
			console.error("Error enviando email via Resend:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, id: data?.id });
	} catch (err) {
		console.error("Email API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
