import { load } from "cheerio";
import { fetchEuskalmetStationData } from "./euskalmet";

export interface WeatherData {
	station: string;
	knots: number;
	kmh: number;
	direction: number;
	temp: number;
	timestamp: string;
	gusts?: number;
}

interface EuskalmetReading {
	sensorId: string;
	type?: string;
	value: number;
}

interface EuskalmetStationData {
	readings: EuskalmetReading[];
}

export async function fetchWeatherData(): Promise<WeatherData> {
	// Priority order:
	// 1. Getxo Bela Eskola (Unisono)
	// 2. Punta Galea (Euskalmet C042)
	// 3. R.C. Marítimo Abra (Unisono)
	// 4. Puerto de Bilbao (Euskalmet B090)

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

		// --- 1. Try Unisono for Getxo Bela Eskola ---
		const unisonoRes = await fetch(
			"https://unisono.connect.ninja/lecturas.php?refresh=true",
			{
				cache: "no-store",
				signal: controller.signal,
			},
		);
		clearTimeout(timeoutId);
		const html = await unisonoRes.text();
		const $ = load(html);

		const tables = $("table");
		let schoolData: WeatherData | null = null;
		let abraData: WeatherData | null = null;

		tables.each((_, table) => {
			const tableText = $(table).text();

			// Getxo Bela Eskola
			if (tableText.includes("Getxo Bela") && tableText.includes("Eskola")) {
				const row = $(table).find("tr").eq(2);
				if (row.length > 0) {
					const cells = row.find("td");
					const knots = parseFloat(cells.eq(1).text());
					if (!isNaN(knots)) {
						schoolData = {
							station: "Getxo Bela Eskola",
							knots,
							kmh: parseFloat((knots * 1.852).toFixed(1)),
							direction: parseFloat(cells.eq(3).text()) || 0,
							temp: parseFloat(cells.eq(4).text()) || 0,
							timestamp: cells.eq(0).text().trim(),
							gusts: parseFloat(cells.eq(2).text()) || 0,
						};
					}
				}
			}

			// RC Maritimo Abra
			if (
				tableText.includes("R.C. Marítimo Abra") &&
				tableText.includes("(minutos)")
			) {
				const row = $(table).find("tr").eq(2);
				if (row.length > 0) {
					const cells = row.find("td");
					const knots = parseFloat(cells.eq(1).text());
					if (!isNaN(knots)) {
						abraData = {
							station: "R.C. Marítimo Abra",
							knots,
							kmh: parseFloat((knots * 1.852).toFixed(1)),
							direction: parseFloat(cells.eq(3).text()) || 0,
							temp: parseFloat(cells.eq(4).text()) || 0,
							timestamp: cells.eq(0).text().trim(),
							gusts: parseFloat(cells.eq(2).text()) || 0,
						};
					}
				}
			}
		});

		// Priority 1: School Data
		if (schoolData) return schoolData;

		// --- 2. Try Punta Galea (Euskalmet C042) ---
		try {
			const galea = (await fetchEuskalmetStationData(
				"C042",
			)) as EuskalmetStationData | null;
			if (galea && galea.readings) {
				// Euskalmet JSON structure check needed, but common is reading[i].value
				// Assuming it returns an object with sensors
				const wind = galea.readings.find(
					(r) => r.sensorId === "wind_speed" || r.type === "wind_speed",
				);
				const dir = galea.readings.find((r) => r.sensorId === "wind_direction");
				const temp = galea.readings.find((r) => r.sensorId === "temperature");

				if (wind) {
					const ms = wind.value; // Euskalmet usually gives m/s
					const knots = parseFloat((ms * 1.94384).toFixed(1));
					return {
						station: "Punta Galea (Euskalmet)",
						knots,
						kmh: parseFloat((ms * 3.6).toFixed(1)),
						direction: dir?.value || 0,
						temp: temp?.value || 0,
						timestamp: new Date().toLocaleTimeString("es-ES", {
							hour: "2-digit",
							minute: "2-digit",
						}),
					};
				}
			}
		} catch (e) {
			console.error("Punta Galea Euskalmet error:", e);
		}

		// Priority 3: Abra Data (Unisono)
		if (abraData) return abraData;

		// --- 4. Try Puerto de Bilbao (Euskalmet B090) ---
		try {
			const puerto = (await fetchEuskalmetStationData(
				"B090",
			)) as EuskalmetStationData | null;
			if (puerto && puerto.readings) {
				const wind = puerto.readings.find((r) => r.sensorId === "wind_speed");
				if (wind) {
					const ms = wind.value;
					const knots = parseFloat((ms * 1.94384).toFixed(1));
					return {
						station: "Puerto de Bilbao (Euskalmet)",
						knots,
						kmh: parseFloat((ms * 3.6).toFixed(1)),
						direction: 0,
						temp: 0,
						timestamp: "API",
					};
				}
			}
		} catch (e) {
			console.error("Puerto Bilbao Euskalmet error:", e);
		}

		// Final fallback to something if everything fails
		throw new Error("No weather data available from Unisono or Euskalmet");
	} catch (error) {
		console.error("Error fetching weather:", error);
		throw error;
	}
}
