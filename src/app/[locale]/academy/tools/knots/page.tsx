"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import KnotViewer from "@/components/academy/interactive/KnotViewer";
import { KNOTS_DATA, type Knot } from "@/lib/academy/knots-data";

export default function KnotsPage() {
	const [selectedKnot, setSelectedKnot] = useState<Knot>(KNOTS_DATA[0]);

	return (
		<div className="min-h-screen bg-nautical-black text-white pb-20">
			{/* Header */}
			<header className="border-b border-white/10 bg-white/5 backdrop-blur-md pt-24 pb-12">
				<div className="container mx-auto px-6">
					<Link
						href="/es/academy"
						className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors mb-6 text-sm"
					>
						<ArrowLeft className="w-4 h-4" /> Volver a la Academia
					</Link>
					<h1 className="text-4xl md:text-6xl font-display italic text-white mb-4">
						Taller de <span className="text-accent">Nudos</span>
					</h1>
					<p className="text-lg text-white/60 max-w-2xl font-light">
						Domina el arte de la cabuyería. Selecciona un nudo para ver el paso
						a paso detallado.
					</p>
				</div>
			</header>

			<main className="container mx-auto px-6 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
					{/* Sidebar / Menu */}
					<div className="lg:col-span-4 space-y-2">
						<h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 px-2">
							Catálogo de Nudos
						</h2>
						{KNOTS_DATA.map((knot) => (
							<button
								key={knot.id}
								onClick={() => setSelectedKnot(knot)}
								className={`w-full text-left p-4 rounded-lg border transition-all duration-300 group
                                    ${
																			selectedKnot.id === knot.id
																				? "bg-accent text-nautical-black border-accent shadow-[0_0_20px_rgba(255,191,0,0.2)]"
																				: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
																		}
                                `}
							>
								<div className="flex justify-between items-center">
									<span className="font-bold font-display italic text-lg">
										{knot.name}
									</span>
									{selectedKnot.id === knot.id && (
										<span className="text-nautical-black">●</span>
									)}
								</div>
								<div
									className={`text-xs mt-1 ${selectedKnot.id === knot.id ? "text-nautical-black/60" : "text-white/40"}`}
								>
									{knot.difficulty} • {knot.category}
								</div>
							</button>
						))}
					</div>

					{/* Viewer Area */}
					<div className="lg:col-span-8">
						<KnotViewer knot={selectedKnot} />
					</div>
				</div>
			</main>
		</div>
	);
}
