import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		// 1. Catálogo completo de logros
		const { data: allAchievements, error: achievementsError } = await supabase
			.from("logros")
			.select("*")
			.order("rareza", { ascending: true });

		if (achievementsError) throw achievementsError;

		// 2. Logros obtenidos por el alumno
		const { data: userAchievements, error: userError } = await supabase
			.from("logros_alumno")
			.select("logro_id, fecha_obtenido")
			.eq("alumno_id", user.id);

		if (userError) throw userError;

		// Mapear el catálogo con el estado del alumno
		const results = allAchievements.map((achievement) => {
			const userAchievement = userAchievements.find(
				(ua) => ua.logro_id === achievement.id,
			);
			return {
				...achievement,
				obtained: !!userAchievement,
				dateObtained: userAchievement?.fecha_obtenido || null,
			};
		});

		return NextResponse.json(results);
	} catch (error) {
		console.error("Error achievements API:", error);
		return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
	}
}
