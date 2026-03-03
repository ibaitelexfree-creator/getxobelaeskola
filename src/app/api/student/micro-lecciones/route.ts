import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const supabase = await createClient();

		const {
			data: { session },
			error: authError,
		} = await supabase.auth.getSession();

		if (authError || !session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data, error } = await supabase
			.from("micro_lecciones")
			.select("*")
			.eq("activo", true)
			.order("orden", { ascending: true });

		if (error) {
			throw error;
		}

		return NextResponse.json(data);
	} catch (error: any) {
		console.error("Error fetching micro-lessons:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", message: error.message },
			{ status: 500 },
		);
	}
}
