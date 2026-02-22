"use client";

import { Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface WeatherLog {
	id: string;
	wind_speed: number;
	wind_direction: number;
	wind_gust: number;
	temperature: number;
	created_at: string;
}

export default function WindSensor() {
	const [data, setData] = useState<WeatherLog | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClient();

	useEffect(() => {
		// Fetch initial data
		const fetchData = async () => {
			const { data: initialData, error } = await supabase
				.from("weather_logs")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (error) {
				console.error("Error fetching initial wind data:", error);
			}

			if (initialData) {
				setData(initialData);
			}
			setLoading(false);
		};

		fetchData();

		// Subscribe to real-time updates
		const channel = supabase
			.channel("weather_realtime")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "weather_logs",
				},
				(payload) => {
					console.log("New weather data received:", payload.new);
					setData(payload.new as WeatherLog);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	if (loading) {
		return <div className="p-4 text-center">Cargando datos de viento...</div>;
	}

	if (!data) {
		return (
			<div className="p-4 text-center">No hay datos de viento disponibles.</div>
		);
	}

	// Determine cardinal direction
	const getCardinalDirection = (angle: number) => {
		const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
		return directions[Math.round(angle / 45) % 8];
	};

	return (
		<div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto border border-gray-100">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
					<Wind className="w-6 h-6 text-blue-500" />
					Viento en tiempo real
				</h2>
				<span className="text-xs text-gray-400">
					{new Date(data.created_at).toLocaleTimeString()}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="bg-blue-50 p-4 rounded-lg text-center">
					<div className="text-sm text-gray-500 mb-1">Velocidad</div>
					<div className="text-3xl font-bold text-blue-600">
						{data.wind_speed?.toFixed(1) || "0.0"}
						<span className="text-sm ml-1 text-gray-500 font-normal">kn</span>
					</div>
					{data.wind_gust && (
						<div className="text-xs text-gray-400 mt-1">
							Racha: {data.wind_gust.toFixed(1)} kn
						</div>
					)}
				</div>

				<div className="bg-orange-50 p-4 rounded-lg text-center flex flex-col items-center justify-center">
					<div className="text-sm text-gray-500 mb-1">Dirección</div>
					<div className="relative w-16 h-16 flex items-center justify-center my-1">
						{/* Compass Arrow */}
						<div
							className="absolute w-full h-full flex items-center justify-center transition-transform duration-500"
							style={{ transform: `rotate(${data.wind_direction || 0}deg)` }}
						>
							<div className="w-1 h-8 bg-orange-500 rounded-full relative bottom-3">
								<div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-orange-500"></div>
							</div>
						</div>
						<div className="absolute text-xs font-bold text-gray-400">N</div>
					</div>
					<div className="text-lg font-bold text-orange-600">
						{data.wind_direction}°{" "}
						{getCardinalDirection(data.wind_direction || 0)}
					</div>
				</div>
			</div>

			{data.temperature && (
				<div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
					<span className="text-gray-500">Temperatura</span>
					<span className="font-semibold text-gray-700">
						{data.temperature}°C
					</span>
				</div>
			)}
		</div>
	);
}
