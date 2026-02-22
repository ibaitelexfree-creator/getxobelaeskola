import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
	try {
		// Security check
		const apiKey = request.headers.get("x-api-key");
		const validKey = process.env.WIND_SENSOR_API_KEY;

		// If no key is configured in env, we might want to fail safe or allow dev.
		// For security, we should require it.
		if (!validKey || apiKey !== validKey) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { wind_speed, wind_direction, wind_gust, temperature } = body;

		// Basic validation
		if (typeof wind_speed !== "number" || typeof wind_direction !== "number") {
			return NextResponse.json(
				{
					error:
						"Invalid data format. wind_speed and wind_direction are required numbers.",
				},
				{ status: 400 },
			);
		}

		const supabase = createAdminClient();

		const { data, error } = await supabase
			.from("weather_logs")
			.insert({
				wind_speed,
				wind_direction,
				wind_gust: wind_gust || wind_speed, // Default gust to speed if not provided
				temperature: temperature || null,
				condition: "IoT Sensor",
			})
			.select()
			.single();

		if (error) {
			console.error("Error inserting weather log:", error);
			return NextResponse.json(
				{ error: "Database error", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
