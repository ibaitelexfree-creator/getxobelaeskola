"use client";
import dynamic from "next/dynamic";
import React from "react";

const LeafletMap = dynamic(
	() => import("@/components/academy/dashboard/LeafletMap"),
	{
		ssr: false,
		loading: () => (
			<div className="w-full h-full bg-nautical-black animate-pulse flex items-center justify-center text-white/20">
				Cargando Mapa...
			</div>
		),
	},
);

// Mock Data for "Popular Routes"
const MOCK_SESSIONS = [
	{
		id: "route-1",
		ubicacion: { lat: 43.345, lng: -3.015 },
		zona_nombre: "Ruta Getxo - Puente Colgante",
		track_log: [
			{ lat: 43.345, lng: -3.015 },
			{ lat: 43.34, lng: -3.018 },
			{ lat: 43.33, lng: -3.02 }, // Puente
			{ lat: 43.325, lng: -3.018 },
			{ lat: 43.32, lng: -3.015 },
		],
	},
	{
		id: "route-2",
		ubicacion: { lat: 43.36, lng: -3.05 },
		zona_nombre: "Salida al Abra Exterior",
		track_log: [
			{ lat: 43.345, lng: -3.015 },
			{ lat: 43.355, lng: -3.03 },
			{ lat: 43.365, lng: -3.06 },
			{ lat: 43.37, lng: -3.08 },
			{ lat: 43.375, lng: -3.09 },
		],
	},
];

export default function KioskMapSlide() {
	const center: [number, number] = [43.345, -3.02];

	return (
		<div className="w-full h-full relative bg-nautical-black">
			<div className="absolute inset-0 z-0 opacity-80">
				<LeafletMap
					center={center}
					mappedSessions={MOCK_SESSIONS}
					livePoints={[]}
					currentPosition={null}
				/>
			</div>

			{/* Overlay Gradient */}
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-nautical-black via-transparent to-transparent opacity-80" />

			<div className="absolute top-12 left-12 z-[1000] bg-nautical-black/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
				<h2 className="text-4xl font-display text-white mb-2">Rutas Comunes</h2>
				<p className="text-accent text-sm uppercase tracking-[0.2em] font-bold">
					Explora el Abra y la Ría de Bilbao
				</p>

				<div className="mt-6 space-y-4">
					{MOCK_SESSIONS.map((session, idx) => (
						<div key={idx} className="flex items-center gap-4 text-white/60">
							<div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
							<span>{session.zona_nombre}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
