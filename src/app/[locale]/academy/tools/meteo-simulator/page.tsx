"use client";

import { ArrowLeft, ChevronRight, CloudRain, Sun, Wind } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import MeteoSimulator from "@/components/academy/interactive/MeteoSimulator";
import {
	METEO_SCENARIOS,
	type MeteoScenario,
} from "@/lib/academy/meteo-scenarios";

export default function MeteoPage({ params }: { params: { locale: string } }) {
	const [selectedScenario, setSelectedScenario] = useState<MeteoScenario>(
		METEO_SCENARIOS[0],
	);

	return (
		<div className="min-h-screen bg-slate-950 text-white pb-20 selection:bg-cyan-500/30">
			{/* Header */}
			<header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md pt-24 pb-12 relative overflow-hidden">
				<div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
					<Wind
						className="w-64 h-64 text-white animate-pulse"
						style={{ animationDuration: "4s" }}
					/>
				</div>

				<div className="container mx-auto px-6 relative z-10">
					<Link
						href={`/${params.locale}/academy/dashboard`}
						className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 transition-colors mb-6 text-[10px] uppercase tracking-widest font-bold"
					>
						<ArrowLeft className="w-3 h-3" /> Volver al Dashboard
					</Link>
					<h1 className="text-4xl md:text-6xl font-black italic text-white mb-4 tracking-tighter uppercase">
						Lab <span className="text-cyan-400">Meteo</span>
					</h1>
					<p className="text-lg text-white/60 max-w-2xl font-light leading-relaxed">
						Simulador de toma de decisiones meteorológicas. Analiza partes
						reales, evalúa la seguridad y planifica tu navegación.
					</p>
				</div>
			</header>

			<main className="container mx-auto px-6 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Sidebar / Scenario Selector */}
					<div className="lg:col-span-3 space-y-2">
						<h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 px-2">
							Escenarios Disponibles
						</h2>

						{METEO_SCENARIOS.map((scenario) => {
							const isSelected = selectedScenario.id === scenario.id;
							return (
								<button
									key={scenario.id}
									onClick={() => setSelectedScenario(scenario)}
									className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden
                                        ${
																					isSelected
																						? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]"
																						: "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white"
																				}
                                    `}
								>
									<div className="flex justify-between items-start mb-1 relative z-10">
										<span className="font-bold italic text-sm leading-tight">
											{scenario.title}
										</span>
										{isSelected && <ChevronRight className="w-4 h-4" />}
									</div>

									<div
										className={`text-[10px] uppercase tracking-wider font-bold mt-2 inline-flex items-center gap-2 px-2 py-0.5 rounded-full
                                        ${isSelected ? "bg-slate-950/20 text-slate-900" : "bg-white/5 text-white/40"}
                                    `}
									>
										<div
											className={`w-1.5 h-1.5 rounded-full ${
												scenario.difficulty === "Básico"
													? "bg-emerald-400"
													: scenario.difficulty === "Intermedio"
														? "bg-amber-400"
														: "bg-red-500"
											}`}
										/>
										{scenario.difficulty}
									</div>
								</button>
							);
						})}
					</div>

					{/* Main Content Area */}
					<div className="lg:col-span-9 min-h-[600px]">
						<MeteoSimulator scenario={selectedScenario} />
					</div>
				</div>
			</main>
		</div>
	);
}
