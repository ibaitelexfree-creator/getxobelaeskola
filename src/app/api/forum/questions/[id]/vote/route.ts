import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = params; // Question ID

	try {
		const body = await request.json();
		const { type } = body; // 'up' or 'down'

		if (!type || (type !== "up" && type !== "down")) {
			return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
		}

		// Check if vote exists
		const { data: existingVote } = await supabase
			.from("foro_votos")
			.select("id, tipo")
			.eq("usuario_id", user.id)
			.eq("item_id", id)
			.eq("item_tipo", "pregunta")
			.single();

		let result;

		if (existingVote) {
			if (existingVote.tipo === type) {
				// Toggle off (delete)
				const { error } = await supabase
					.from("foro_votos")
					.delete()
					.eq("id", existingVote.id);
				if (error) throw error;
				result = { action: "removed" };
			} else {
				// Change vote
				const { error } = await supabase
					.from("foro_votos")
					.update({ tipo: type })
					.eq("id", existingVote.id);
				if (error) throw error;
				result = { action: "updated" };
			}
		} else {
			// Insert new vote
			const { error } = await supabase.from("foro_votos").insert({
				usuario_id: user.id,
				item_id: id,
				item_tipo: "pregunta",
				tipo: type,
			});
			if (error) throw error;
			result = { action: "created" };
		}

		return NextResponse.json(result);
	} catch (e: any) {
		console.error("Error voting:", e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
