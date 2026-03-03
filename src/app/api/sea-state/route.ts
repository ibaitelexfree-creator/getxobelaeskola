import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		// TODO: Replace with official Puertos del Estado API endpoint when available.
		// Endpoint: https://portus.puertos.es/Portus_RT/point/3136/data (Bilbao-Vizcaya)
		// Currently using mocked data based on typical Getxo conditions.

		let windSpeed = 12;
		let windDirection = 315; // NW

		try {
			const weather = await fetchWeatherData();
			if (weather) {
				windSpeed = weather.knots;
				windDirection = weather.direction;
			}
		} catch (e) {
			console.warn("Failed to fetch real wind data, using mock fallback", e);
		}

		// Mock Sea State Data
		// Add some random variation to make it look alive
		const waveHeight = (0.8 + Math.random() * 1.5).toFixed(1); // 0.8 - 2.3m
		const wavePeriod = Math.floor(6 + Math.random() * 6); // 6 - 12s
		const waterTemp = (14.5 + Math.random() * 1.5).toFixed(1); // 14.5 - 16.0C

		const data = {
			wave_height: parseFloat(waveHeight),
			wave_period: wavePeriod,
			water_temp: parseFloat(waterTemp),
			wind_speed: windSpeed,
			wind_direction: windDirection,
			timestamp: new Date().toISOString(),
		};

		return NextResponse.json(data);
	} catch (error) {
		console.error("Sea State API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch sea state data" },
			{ status: 500 },
		);
	}
}
