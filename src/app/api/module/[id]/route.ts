import { NextResponse } from "next/server";
import { verifyModuleAccess } from "@/lib/academy/enrollment";
import { corsHeaders, withCors } from "@/lib/api-headers";
import { requireAuth } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return new NextResponse(null, {
		status: 204,
		headers: corsHeaders(request),
	});
}

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	console.log("[API-DEBUG] Hit module route for ID:", params);
	try {
		// 1. AUTHENTICATION
		const authResult = await requireAuth();
		const { user, error } = authResult;

		if (error || !user) {
			console.error("[API-DEBUG] Auth failed:", error);
			return withCors(
				NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
				request,
			);
		}

		console.log(
			"[API] Checking access for user:",
			user.id,
			"module:",
			params.id,
		);
		const hasAccess = await verifyModuleAccess(user.id, params.id);
		console.log("[API] verifyModuleAccess result:", hasAccess);

		if (!hasAccess) {
			// Debugging: Explicit error
			return withCors(
				NextResponse.json({ error: "Access Denied" }, { status: 403 }),
				request,
			);
		}

		// We verified access logic above, so we can use Admin Client to bypass RLS limitations
		const supabase = createAdminClient();
		console.log(
			"[API-DEBUG] Admin Client created. Key present:",
			!!process.env.SUPABASE_SERVICE_ROLE_KEY,
		);

		const { data: modulo, error: moduloError } = await supabase
			.from("modulos")
			.select(`
                id,
                curso_id,
                nombre_es,
                nombre_eu,
                descripcion_es,
                descripcion_eu,
                imagen_url,
                orden,
                curso:curso_id (
                    id,
                    slug,
                    nombre_es,
                    nombre_eu,
                    nivel_formacion:nivel_formacion_id (
                        slug,
                        nombre_es,
                        nombre_eu,
                        orden
                    )
                )
            `)
			.eq("id", params.id)
			.single();

		if (moduloError || !modulo) {
			console.error("[API-DEBUG] Module fetch failed:", moduloError);
			return withCors(
				NextResponse.json({ error: "Resource not found" }, { status: 404 }),
				request,
			);
		}

		const { data: unidades, error: unidadesError } = await supabase
			.from("unidades_didacticas")
			.select(
				"id, nombre_es, nombre_eu, descripcion_es, descripcion_eu, duracion_estimada_min, orden, slug, objetivos_es, objetivos_eu",
			)
			.eq("modulo_id", params.id)
			.order("orden");

		if (unidadesError) {
			console.error("Units fetch error:", unidadesError);
			return withCors(
				NextResponse.json({ error: "Error loading units" }, { status: 500 }),
				request,
			);
		}

		let progresoModulo = null;
		let progresoUnidades: any[] = [];
		try {
			const { data: progresoMod } = await supabase
				.from("progreso_alumno")
				.select("*")
				.eq("alumno_id", user.id)
				.eq("tipo_entidad", "modulo")
				.eq("entidad_id", params.id)
				.single();
			progresoModulo = progresoMod;

			if (unidades && unidades.length > 0) {
				const { data: progresoUni } = await supabase
					.from("progreso_alumno")
					.select("*")
					.eq("alumno_id", user.id)
					.eq("tipo_entidad", "unidad")
					.in(
						"entidad_id",
						unidades.map((u) => u.id),
					);
				progresoUnidades = progresoUni || [];
			}
		} catch {}

		return withCors(
			NextResponse.json({
				modulo,
				unidades: unidades || [],
				progreso: progresoModulo,
				progreso_unidades: progresoUnidades,
			}),
			request,
		);
	} catch (err) {
		console.error("Error fetching module:", err);
		return withCors(
			NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
			request,
		);
	}
}
