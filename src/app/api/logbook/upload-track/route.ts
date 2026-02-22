import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	try {
		const { user, error: authError } = await requireAuth();
		if (authError || !user)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const formData = await req.formData();
		const file = formData.get("file") as File;
		const sessionId = formData.get("sessionId") as string;

		if (!file || !sessionId) {
			return NextResponse.json(
				{ error: "Missing file or sessionId" },
				{ status: 400 },
			);
		}

		const text = await file.text();

		// Simple GPX (XML) parsing using Regex to avoid heavy dependencies
		// We look for <trkpt lat="..." lon="..."> tags
		const coords: { lat: number; lng: number }[] = [];
		const trkptRegex =
			/<trkpt\s+lat="([-+]?\d*\.\d+|\d+)"\s+lon="([-+]?\d*\.\d+|\d+)"/g;
		let match;

		while ((match = trkptRegex.exec(text)) !== null) {
			coords.push({
				lat: parseFloat(match[1]),
				lng: parseFloat(match[2]),
			});
		}

		// Simplify coordinates if there are too many (max 200 points for rendering)
		let simplifiedCoords = coords;
		if (coords.length > 200) {
			const step = Math.ceil(coords.length / 200);
			simplifiedCoords = coords.filter((_, i) => i % step === 0);
		}

		if (simplifiedCoords.length === 0) {
			return NextResponse.json(
				{ error: "No valid coordinates found in GPX" },
				{ status: 400 },
			);
		}

		const supabase = createClient();

		// 1. Upload original GPX to Storage
		const filePath = `tracks/${user.id}/${sessionId}_${Date.now()}.gpx`;
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from("academy-assets")
			.upload(filePath, file);

		if (uploadError) throw uploadError;

		// 2. Update horas_navegacion with track log and url
		const { error: updateError } = await supabase
			.from("horas_navegacion")
			.update({
				track_log: simplifiedCoords,
				gpx_url: filePath,
				// Also update main location to the starting point if not set
				ubicacion: {
					lat: simplifiedCoords[0].lat,
					lng: simplifiedCoords[0].lng,
				},
			})
			.eq("id", sessionId)
			.eq("alumno_id", user.id);

		if (updateError) throw updateError;

		return NextResponse.json({
			success: true,
			pointsCount: simplifiedCoords.length,
			track: simplifiedCoords,
		});
	} catch (err) {
		console.error("Error processing GPX:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
