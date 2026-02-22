import { NextResponse } from "next/server";
import { contactNotificationTemplate } from "@/lib/email-templates";
import { DEFAULT_FROM_EMAIL, resend } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { nombre, email, asunto, mensaje, telefono } = body;

		// 1. Validation
		if (!nombre || !email || !asunto || !mensaje) {
			return NextResponse.json(
				{ error: "Faltan campos obligatorios" },
				{ status: 400 },
			);
		}

		// 2. Save to Database
		const supabase = await createClient();
		const { error: dbError } = await supabase.from("mensajes_contacto").insert([
			{
				nombre,
				email,
				asunto,
				mensaje,
				telefono,
				created_at: new Date().toISOString(),
			},
		]);

		if (dbError) {
			console.error("Database Error (Contact):", dbError);
			// We continue even if DB fails, as email is usually more critical for notification
		}

		// 3. Send Notification Email
		// Define internal admin email (could be an env var)
		const adminEmail = process.env.ADMIN_EMAIL || "info@getxobelaeskola.com";

		if (resend) {
			try {
				await resend.emails.send({
					from: DEFAULT_FROM_EMAIL,
					to: adminEmail,
					subject: `[Web Contact] ${asunto}`,
					html: contactNotificationTemplate({
						nombre,
						email,
						asunto,
						mensaje,
						telefono,
					}),
				});
			} catch (emailError) {
				console.error("Email Error (Contact):", emailError);
			}
		} else {
			console.log("--- EMAIL SIMULATION (CONTACT) ---");
			console.log("To:", adminEmail);
			console.log("Subject:", asunto);
			console.log("Message:", mensaje);
			console.log("---------------------------------");
		}

		return NextResponse.json({
			success: true,
			message: "Mensaje recibido correctamente",
		});
	} catch (err: any) {
		console.error("API Contact Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
