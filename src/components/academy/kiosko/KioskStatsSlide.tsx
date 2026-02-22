"use client";
import { AlertTriangle, Ship, Thermometer, Wind } from "lucide-react";
import React, { useEffect, useState } from "react";

interface WeatherData {
	weather: {
		knots: number;
		direction: number;
		temp: number;
		desc?: string;
	};
	alerts: any[];
	fleet: {
		agua: number;
		retorno: number;
		pendiente: number;
	};
}

export default function KioskStatsSlide() {
	const [data, setData] = useState<WeatherData | null>(null);

	useEffect(() => {
		fetch("/api/weather")
			.then((res) => {
				if (!res.ok) throw new Error("Fetch failed");
				return res.json();
			})
			.then((d) => setData(d))
			.catch((err) => {
				console.error("Weather fetch failed, using mock data:", err);
				// Fallback Mock Data
				setData({
					weather: { knots: 12.5, direction: 310, temp: 18.2 },
					alerts: [],
					fleet: { agua: 3, retorno: 1, pendiente: 2 },
				});
			});
	}, []);

	if (!data)
		return (
			<div className="w-full h-full bg-nautical-black flex items-center justify-center text-white/20 animate-pulse text-2xl font-display uppercase tracking-widest">
				Cargando Meteo...
			</div>
		);

	const { weather, fleet, alerts } = data;

	return (
		<div className="w-full h-full bg-nautical-black p-24 flex flex-col justify-center relative overflow-hidden">
			{/* Background Accents */}
			<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-60" />
			<div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 opacity-60" />

			<div className="relative z-10">
				<h2 className="text-5xl font-display text-white mb-16 flex items-center gap-6">
					<span className="text-accent animate-pulse">⚡</span> Condiciones en
					Tiempo Real
				</h2>

				<div className="grid grid-cols-2 gap-12">
					{/* Wind Card */}
					<div className="bg-white/5 border border-white/10 p-12 rounded-[2rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
						<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

						<div className="flex items-center gap-6 mb-8 text-white/60">
							<Wind size={48} className="text-blue-400" />
							<span className="text-xl uppercase tracking-[0.2em] font-bold">
								Viento (Nudos)
							</span>
						</div>
						<div className="text-9xl font-black text-white font-mono tracking-tighter flex items-baseline">
							{weather?.knots?.toFixed(1) || "--"}
							<span className="text-3xl text-accent ml-4 font-sans font-bold">
								kn
							</span>
						</div>
						<div className="mt-8 text-white/40 text-2xl flex items-center gap-4">
							Dirección:{" "}
							<span className="text-white font-mono">
								{weather?.direction || 0}°
							</span>
							<div
								className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"
								style={{ transform: `rotate(${weather?.direction || 0}deg)` }}
							>
								↑
							</div>
						</div>
					</div>

					{/* Temp & Fleet Stack */}
					<div className="flex flex-col gap-12">
						{/* Temp Card */}
						<div className="bg-white/5 border border-white/10 p-10 rounded-[2rem] backdrop-blur-xl shadow-xl flex items-center justify-between">
							<div className="flex items-center gap-6">
								<Thermometer size={48} className="text-orange-400" />
								<span className="text-white/60 text-xl uppercase tracking-[0.2em] font-bold">
									Temperatura
								</span>
							</div>
							<div className="text-7xl font-black text-white font-mono">
								{weather?.temp?.toFixed(1) || "--"}°
							</div>
						</div>

						{/* Fleet Status */}
						<div className="bg-white/5 border border-white/10 p-10 rounded-[2rem] backdrop-blur-xl shadow-xl flex-grow flex flex-col justify-between">
							<div className="flex items-center gap-6 mb-8">
								<Ship size={48} className="text-emerald-400" />
								<span className="text-white/60 text-xl uppercase tracking-[0.2em] font-bold">
									Estado de Flota
								</span>
							</div>
							<div className="flex justify-between items-end gap-4">
								<div className="text-center bg-blue-500/10 p-6 rounded-2xl flex-1 border border-blue-500/20">
									<div className="text-6xl font-black text-white">
										{fleet?.agua || 0}
									</div>
									<div className="text-sm text-blue-400 uppercase tracking-widest mt-2 font-bold">
										En Agua
									</div>
								</div>
								<div className="text-center bg-white/5 p-6 rounded-2xl flex-1 border border-white/5">
									<div className="text-6xl font-black text-white/50">
										{fleet?.retorno || 0}
									</div>
									<div className="text-sm text-white/30 uppercase tracking-widest mt-2 font-bold">
										Regresando
									</div>
								</div>
								<div className="text-center bg-white/5 p-6 rounded-2xl flex-1 border border-white/5">
									<div className="text-6xl font-black text-white/30">
										{fleet?.pendiente || 0}
									</div>
									<div className="text-sm text-white/20 uppercase tracking-widest mt-2 font-bold">
										En Tierra
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Alerts Footer */}
				{alerts && alerts.length > 0 && (
					<div className="mt-12 bg-red-600/20 border border-red-500/40 p-8 rounded-3xl flex items-center gap-8 animate-pulse shadow-[0_0_50px_rgba(220,38,38,0.2)]">
						<div className="p-4 bg-red-500 rounded-full text-white shadow-lg animate-bounce">
							<AlertTriangle size={40} />
						</div>
						<div>
							<h3 className="text-red-300 font-black uppercase tracking-[0.2em] text-lg mb-2">
								Alerta Meteorológica Activa
							</h3>
							<p className="text-white text-3xl font-light leading-snug">
								{alerts[0].level}: {alerts[0].text}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
