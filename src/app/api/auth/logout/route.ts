import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const supabase = createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const { searchParams } = new URL(request.url);
	const locale = searchParams.get("locale") || "es";

	return NextResponse.json({
		success: true,
		redirect: `/${locale}/auth/login`,
	});
}
