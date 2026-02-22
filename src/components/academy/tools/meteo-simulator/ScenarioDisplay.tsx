"use client";

import { AlertTriangle, Eye, ThermometerSun, Waves, Wind } from "lucide-react";
import React from "react";
import type { MeteoScenario } from "@/data/academy/meteo-scenarios";

interface ScenarioDisplayProps {
	scenario: MeteoScenario;
}

export default function ScenarioDisplay({ scenario }: ScenarioDisplayProps) {
	const { meteoReport } = scenario;

	return (
		<div className="bg-white text-nautical-black rounded-sm shadow-lg border border-gray-300 overflow-hidden font-mono text-sm">
			{/* Header simulating AEMET PDF */}
			<div className="bg-blue-900 text-white p-4 flex justify-between items-center">
				<div>
					<h2 className="text-xl font-bold uppercase tracking-wider">
						Boletín Meteorológico
					</h2>
					<p className="text-xs opacity-80">Agencia Estatal de Meteorología</p>
				</div>
				<div className="text-right">
					<div className="font-bold">{meteoReport.date}</div>
					<div className="text-xs opacity-80">{meteoReport.location}</div>
				</div>
			</div>

			{/* Synopsis */}
			<div className="p-4 border-b border-gray-200 bg-gray-50">
				<h3 className="font-bold uppercase text-xs text-gray-500 mb-1">
					Situación Sinóptica
				</h3>
				<p className="text-gray-800">{meteoReport.synopsis}</p>
			</div>

			{/* Grid of Data */}
			<div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-200">
				<div className="p-4 space-y-4">
					<div className="flex items-start gap-3">
						<Wind className="w-5 h-5 text-blue-600 mt-1" />
						<div>
							<span className="block font-bold text-gray-500 text-xs uppercase">
								Viento
							</span>
							<span className="font-semibold">{meteoReport.wind}</span>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<Waves className="w-5 h-5 text-cyan-600 mt-1" />
						<div>
							<span className="block font-bold text-gray-500 text-xs uppercase">
								Estado de la Mar
							</span>
							<span className="font-semibold">{meteoReport.seaState}</span>
						</div>
					</div>
				</div>

				<div className="p-4 space-y-4">
					<div className="flex items-start gap-3">
						<Eye className="w-5 h-5 text-gray-600 mt-1" />
						<div>
							<span className="block font-bold text-gray-500 text-xs uppercase">
								Visibilidad
							</span>
							<span className="font-semibold">{meteoReport.visibility}</span>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<ThermometerSun className="w-5 h-5 text-orange-600 mt-1" />
						<div>
							<span className="block font-bold text-gray-500 text-xs uppercase">
								Presión / Tendencia
							</span>
							<span className="font-semibold">{meteoReport.pressure}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Context Warning */}
			<div className="bg-amber-50 p-4 border-t border-amber-100 flex gap-3 items-center text-amber-900">
				<AlertTriangle className="w-5 h-5 text-amber-600" />
				<div className="text-sm italic">
					<strong>Contexto:</strong> {scenario.context}
				</div>
			</div>
		</div>
	);
}
