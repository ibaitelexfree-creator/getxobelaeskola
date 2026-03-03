import { apiUrl } from "../api";

export interface TideEvent {
	time: string;
	type: "high" | "low";
	height: number;
}

export interface WeatherData {
	windSpeed: number; // knots
	windDirection: number; // degrees
	windGust: number; // knots
	tideHeight: number; // meters
	tideStatus: "rising" | "falling" | "stable";
	nextTides: TideEvent[];
	temperature: number; // celsius
	pressure: number; // hPa
	condition: string;
	visibility: number; // nm
	isLive?: boolean;
}

export interface ConditionAlert {
	type: "ideal" | "caution" | "warning";
	message: string;
}

export const WeatherService = {
	/**
	 * Fetches current weather for Getxo.
	 * Currently mocked but ready for real API integration.
	 */
	async getGetxoWeather(): Promise<WeatherData> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			const res = await fetch(apiUrl("/api/weather"), {
				signal: controller.signal,
				cache: "no-store",
			});
			clearTimeout(timeoutId);

			if (!res.ok) throw new Error("Failed to fetch weather");
			const data = await res.json();

			// The /api/weather route returns { weather: {...}, fleet: {...}, alerts: [...] }
			// We need to extract the 'weather' part and map it to our interface
			const raw = data.weather || {};

			return {
				windSpeed: raw.knots || 0,
				windDirection: raw.direction || 0,
				windGust: raw.gusts || raw.knots || 0,
				tideHeight: raw.tideHeight || 0,
				tideStatus: raw.tideStatus || "stable",
				nextTides: raw.nextTides || [],
				temperature: raw.temp || 0,
				pressure: raw.pressure || 1013,
				condition: raw.condition || "Clear",
				visibility: raw.visibility || 10,
				isLive: true,
			};
		} catch (error) {
			console.error("Error in WeatherService:", error);
			// Return realistic mock as very last fallback
			return {
				windSpeed: 10,
				windGust: 12,
				windDirection: 280,
				tideHeight: 1.5,
				tideStatus: "rising",
				nextTides: [],
				temperature: 14,
				pressure: 1013,
				condition: "Cloudy",
				visibility: 10,
				isLive: false, // Added isLive to the mock data
			};
		}
	},

	/**
	 * Generates a condition alert based on wind speed and user rank
	 */
	getConditionAlert(windSpeed: number, rankSlug: string): ConditionAlert {
		// Ranks mapping: marinero, timonel, patron, capitan...

		if (windSpeed < 5) {
			return {
				type: "caution",
				message: "⚠️ CALMA CHICHA. POCO VIENTO PARA MANIOBRAS TÉCNICAS.",
			};
		}

		if (windSpeed >= 5 && windSpeed <= 18) {
			return {
				type: "ideal",
				message: "✅ CONDICIONES IDEALES. BUEN MOMENTO PARA SALIR A NAVEGAR.",
			};
		}

		if (windSpeed > 18 && windSpeed <= 25) {
			if (rankSlug === "marinero" || rankSlug === "timonel") {
				return {
					type: "caution",
					message:
						"⚠️ VIENTO FUERTE. SE RECOMIENDA NAVEGACIÓN CON INSTRUCTOR O PATRÓN.",
				};
			}
			return {
				type: "ideal",
				message: "⛵ VIENTO FRESCO. EXCELENTE PARA ENTRENAMIENTO AVANZADO.",
			};
		}

		if (windSpeed > 25) {
			return {
				type: "warning",
				message: "🚨 CONDICIONES EXTREMAS. SE RECOMIENDA PERMANECER EN PUERTO.",
			};
		}

		return {
			type: "ideal",
			message: "VALORES DENTRO DE LA MEDIA PARA NAVEGACIÓN SEGURA.",
		};
	},
};
