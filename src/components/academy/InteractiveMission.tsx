"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import React, { useState } from "react";

interface InteractiveMissionProps {
	data: any;
	onComplete?: () => void;
}

export default function InteractiveMission({
	data,
	onComplete,
}: InteractiveMissionProps) {
	if (!data || !data.tipo_contenido) return null;

	if (data.tipo_contenido === "inventario") {
		return <InventoryMission data={data} onComplete={onComplete} />;
	}

	if (data.tipo_contenido === "mision_tactica") {
		return <TacticMission data={data} onComplete={onComplete} />;
	}

	if (data.tipo_contenido === "mision_nudos") {
		return <KnotsMission data={data} onComplete={onComplete} />;
	}

	return (
		<div className="p-8 bg-white/5 border border-white/10 rounded-sm text-center">
			<p className="text-white/80 italic font-display" role="status">
				Esta unidad tiene contenido interactivo que se está cargando...
			</p>
		</div>
	);
}

function InventoryMission({
	data,
	onComplete,
}: {
	data: any;
	onComplete?: () => void;
}) {
	const [found, setFound] = useState<string[]>([]);
	const items = data.items || [];

	const toggleItem = (item: string) => {
		if (found.includes(item)) return;
		const newFound = [...found, item];
		setFound(newFound);
		if (newFound.length === items.length && onComplete) {
			onComplete();
		}
	};

	return (
		<div className="bg-premium-mesh p-8 border-2 border-accent/40 rounded-sm">
			<h3 className="text-2xl font-display italic text-white mb-4">
				🎒 Misión: Inventario de Cubierta
			</h3>
			<p className="text-white/80 mb-8">{data.mision}</p>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{items.map((item: string) => (
					<button
						key={item}
						onClick={() => toggleItem(item)}
						className={`p-4 border transition-all duration-300 ${
							found.includes(item)
								? "bg-accent border-accent text-nautical-black font-bold"
								: "bg-white/5 border-white/10 text-white/70 hover:border-accent/40 hover:text-white"
						}`}
						aria-pressed={found.includes(item)}
					>
						<span className="text-3xs uppercase tracking-widest font-black">
							{item}
						</span>
						{found.includes(item) && <span className="block mt-1">✓</span>}
					</button>
				))}
			</div>

			<div className="mt-8 text-center text-3xs tracking-widest text-accent/60 font-black uppercase">
				Encontrados: {found.length} / {items.length}
			</div>
			{found.length === items.length && (
				<div className="mt-6 text-accent animate-pulse">
					¡Inventario Completo!
				</div>
			)}
		</div>
	);
}

function TacticMission({
	data,
	onComplete,
}: {
	data: any;
	onComplete?: () => void;
}) {
	const [current, setCurrent] = useState(0);
	const [selected, setSelected] = useState<number | null>(null);
	const scenarios = data.escenarios || [];
	const currentScenario = scenarios[current];

	const checkAnswer = (idx: number) => {
		setSelected(idx);
		if (idx === currentScenario.correcta) {
			if (current < scenarios.length - 1) {
				setTimeout(() => {
					setCurrent(current + 1);
					setSelected(null);
				}, 1000);
			} else if (onComplete) {
				onComplete();
			}
		}
	};

	return (
		<div className="bg-nautical-black p-8 border-2 border-red-500/40 rounded-sm relative overflow-hidden">
			<div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
				<span className="text-8xl">⚓</span>
			</div>
			<h3 className="text-2xl font-display italic text-white mb-2">
				🔴 Misión: Protocolo de Choque
			</h3>
			<p className="text-red-400 text-3xs uppercase font-bold tracking-widest mb-8">
				ESCENARIO {current + 1} DE {scenarios.length}
			</p>

			<div className="glass-panel p-6 mb-8 border-white/10">
				<p className="text-xl text-white mb-6 font-display italic">
					{currentScenario.pregunta}
				</p>
				<div className="flex flex-col gap-3">
					{currentScenario.opciones.map((opt: string, idx: number) => (
						<button
							key={idx}
							onClick={() => checkAnswer(idx)}
							disabled={selected !== null}
							className={`p-4 text-left border transition-all duration-300 ${
								selected === null
									? "border-white/10 hover:border-accent hover:bg-white/5"
									: idx === currentScenario.correcta
										? "bg-green-500/20 border-green-500 text-green-200"
										: selected === idx
											? "bg-red-500/20 border-red-500 text-red-200"
											: "opacity-50 border-white/10 text-white/60"
							}`}
						>
							{opt}
						</button>
					))}
				</div>
				{selected !== null && (
					<div
						className={`mt-6 p-4 text-sm ${selected === currentScenario.correcta ? "text-accent" : "text-red-400"}`}
					>
						{currentScenario.explicacion}
					</div>
				)}
			</div>
		</div>
	);
}

function KnotsMission({
	data,
	onComplete,
}: {
	data: any;
	onComplete?: () => void;
}) {
	const [studied, setStudied] = useState<string[]>([]);
	const nudos = data.nudos || [];
	const locale = useLocale();

	const study = (id: string) => {
		if (!studied.includes(id)) {
			const next = [...studied, id];
			setStudied(next);
			if (next.length === nudos.length && onComplete) onComplete();
		}
	};

	return (
		<div className="bg-gradient-to-br from-blue-900/40 to-black p-8 border-2 border-blue-500/40 rounded-sm">
			<h3 className="text-2xl font-display italic text-white mb-4">
				🪢 Misión: Taller de Nudos
			</h3>
			<p className="text-white/70 mb-8">{data.mision}</p>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{nudos.map((nudo: any) => (
					<div
						key={nudo.id}
						className="glass-card p-6 border-white/5 flex flex-col justify-between"
					>
						<div>
							<h4 className="text-lg font-display italic text-accent mb-2">
								{nudo.nombre}
							</h4>
							<p className="text-2xs text-white/40 mb-4">{nudo.desc}</p>
						</div>
						<Link
							href={`/${locale}/academy/tools/knots`}
							onClick={() => study(nudo.id)}
							aria-label={
								studied.includes(nudo.id)
									? `Nudo ${nudo.nombre} estudiado`
									: `Aprender nudo ${nudo.nombre}`
							}
							className={`text-center py-2 text-3xs uppercase font-black tracking-widest transition-all ${studied.includes(nudo.id) ? "text-accent" : "text-white/70 hover:text-white"}`}
						>
							{studied.includes(nudo.id) ? "✓ Estudiado" : "Aprender →"}
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}
