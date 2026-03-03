"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, MapPin, Waves } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { isPointInWater } from "@/lib/geospatial/water-check";

export const WaterDemo: React.FC = () => {
	const [coords, setCoords] = useState({ lat: 43.348, lng: -3.018 }); // Getxo Port
	const [inWater, setInWater] = useState<boolean | null>(null);

	const testPositions = [
		{ name: "Puerto Getxo", lat: 43.3485, lng: -3.0185 },
		{ name: "Santurtzi", lat: 43.33, lng: -3.03 },
		{ name: "Centro Abra", lat: 43.355, lng: -3.05 },
		{ name: "Zierbena Outer", lat: 43.375, lng: -3.09 },
		{ name: "Tierra (Algorta)", lat: 43.355, lng: -3.005 },
		{ name: "Tierra (Portugalete)", lat: 43.32, lng: -3.02 },
	];

	useEffect(() => {
		setInWater(isPointInWater(coords.lat, coords.lng));
	}, [coords]);

	const handleRandomize = () => {
		const rand =
			testPositions[Math.floor(Math.random() * testPositions.length)];
		setCoords({ lat: rand.lat, lng: rand.lng });
	};

	return (
		<div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 text-white shadow-2xl max-w-md mx-auto">
			<div className="flex items-center gap-3 mb-6">
				<div className="p-3 bg-blue-500/20 rounded-xl">
					<Waves className="text-blue-400 w-6 h-6" />
				</div>
				<div>
					<h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
						Validador Geofencing
					</h2>
					<p className="text-slate-400 text-xs">Detección de Agua vs Tierra</p>
				</div>
			</div>

			<div className="space-y-4 mb-8">
				<div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
					<div className="flex items-center gap-2 mb-2 text-slate-300">
						<MapPin className="w-4 h-4" />
						<span className="text-sm font-medium">Coordenadas Actuales</span>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-[10px] text-slate-500 uppercase tracking-wider">
								Latitud
							</label>
							<div className="font-mono text-blue-300">
								{coords.lat.toFixed(6)}
							</div>
						</div>
						<div>
							<label className="text-[10px] text-slate-500 uppercase tracking-wider">
								Longitud
							</label>
							<div className="font-mono text-blue-300">
								{coords.lng.toFixed(6)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-center">
					<motion.div
						animate={{ scale: inWater ? [1, 1.05, 1] : 1 }}
						transition={{ duration: 2, repeat: Infinity }}
						className={`w-full py-8 rounded-3xl flex flex-col items-center gap-2 transition-colors duration-500 ${
							inWater === true
								? "bg-blue-500/10 border border-blue-500/30"
								: inWater === false
									? "bg-amber-500/10 border border-amber-500/30"
									: "bg-slate-800 border border-slate-700"
						}`}
					>
						{inWater === true ? (
							<>
								<CheckCircle className="text-blue-400 w-12 h-12 mb-2" />
								<span className="text-2xl font-black text-blue-400 uppercase tracking-tighter">
									ESTÁS EN AGUA
								</span>
								<span className="text-xs text-blue-300/70">
									Navegación segura permitida
								</span>
							</>
						) : inWater === false ? (
							<>
								<AlertTriangle className="text-amber-500 w-12 h-12 mb-2" />
								<span className="text-2xl font-black text-amber-500 uppercase tracking-tighter">
									ESTÁS EN TIERRA
								</span>
								<span className="text-xs text-amber-500/70">
									¡Peligro! Encallamiento detectado
								</span>
							</>
						) : (
							<span className="text-slate-500 italic">
								Analizando superficie...
							</span>
						)}
					</motion.div>
				</div>
			</div>

			<button
				onClick={handleRandomize}
				className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
			>
				Simular Nueva Posición
			</button>
			<p className="text-[10px] text-slate-500 text-center mt-4">
				Basado en Geometría Real de OpenStreetMap (Getxo & Abra)
			</p>
		</div>
	);
};
