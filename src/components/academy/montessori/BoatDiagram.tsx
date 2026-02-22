"use client";

import { motion } from "framer-motion";
import React from "react";

interface BoatDiagramProps {
	highlightId?: string | null;
	onPartClick?: (partId: string) => void;
	className?: string;
}

export default function BoatDiagram({
	highlightId,
	onPartClick,
	className = "",
}: BoatDiagramProps) {
	const isActive = (id: string) => highlightId === id;

	// Base styles for parts
	const baseStyle =
		"fill-transparent stroke-white/20 stroke-2 transition-all duration-300 cursor-pointer hover:stroke-accent/50";
	const activeStyle =
		"fill-accent/10 stroke-accent stroke-[3] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]";
	const textStyle =
		"text-xs fill-white/40 pointer-events-none select-none uppercase tracking-widest";

	const getPartClass = (id: string) =>
		`${baseStyle} ${isActive(id) ? activeStyle : ""}`;

	return (
		<svg
			viewBox="0 0 500 500"
			className={`w-full h-full ${className}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* DEFINITIONS */}
			<defs>
				<filter id="glow">
					<feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* WATER LINE REFERENCE */}
			<line
				x1="50"
				y1="350"
				x2="450"
				y2="350"
				className="stroke-blue-400/20 stroke-1"
				strokeDasharray="5,5"
			/>

			{/* GROUP: ESTRUCTURA */}
			<g id="structure">
				{/* BABOR / ESTRIBOR Click Areas (Invisible halves) */}
				<rect
					x="0"
					y="0"
					width="250"
					height="500"
					className={`fill-transparent cursor-pointer ${isActive("babor") ? "fill-red-500/10" : ""}`}
					onClick={() => onPartClick?.("babor")}
				/>
				<rect
					x="250"
					y="0"
					width="250"
					height="500"
					className={`fill-transparent cursor-pointer ${isActive("estribor") ? "fill-green-500/10" : ""}`}
					onClick={() => onPartClick?.("estribor")}
				/>

				{/* TIMON */}
				<motion.path
					d="M110 350 L110 420 L140 420 L130 350 Z"
					className={getPartClass("timon")}
					onClick={() => onPartClick?.("timon")}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				/>

				{/* QUILLA */}
				<motion.path
					d="M230 380 L230 460 L280 460 L290 380 Z"
					className={getPartClass("quilla")}
					onClick={() => onPartClick?.("quilla")}
				/>

				{/* CASCO */}
				<motion.path
					d="M100 300 Q250 300 400 300 L380 380 Q250 380 120 370 Z"
					className={getPartClass("casco")}
					onClick={() => onPartClick?.("casco")}
				/>

				{/* CUBIERTA (Deck line) */}
				<motion.path
					d="M100 300 Q250 300 400 300"
					className={`${getPartClass("cubierta")} fill-none stroke-[4]`}
					onClick={() => onPartClick?.("cubierta")}
				/>

				{/* POPA (Area click invisible o resaltado parcial) */}
				<circle
					cx="110"
					cy="320"
					r="30"
					className={`fill-transparent cursor-pointer ${isActive("popa") ? "stroke-accent stroke-2" : "stroke-transparent"}`}
					onClick={() => onPartClick?.("popa")}
				/>

				{/* PROA */}
				<circle
					cx="390"
					cy="320"
					r="30"
					className={`fill-transparent cursor-pointer ${isActive("proa") ? "stroke-accent stroke-2" : "stroke-transparent"}`}
					onClick={() => onPartClick?.("proa")}
				/>

				{/* BABOR/ESTRIBOR Labels */}
				{isActive("babor") && (
					<text
						x="125"
						y="150"
						textAnchor="middle"
						className="fill-red-400/80 text-4xl font-black opacity-50 select-none pointer-events-none"
					>
						BABOR
					</text>
				)}
				{isActive("estribor") && (
					<text
						x="375"
						y="150"
						textAnchor="middle"
						className="fill-green-400/80 text-4xl font-black opacity-50 select-none pointer-events-none"
					>
						ESTRIBOR
					</text>
				)}
			</g>

			{/* GROUP: APAREJO */}
			<g id="rigging">
				{/* MASTIL */}
				<motion.line
					x1="280"
					y1="300"
					x2="280"
					y2="50"
					className={getPartClass("mastil")}
					onClick={() => onPartClick?.("mastil")}
				/>

				{/* BOTAVARA */}
				<motion.line
					x1="280"
					y1="280"
					x2="130"
					y2="250"
					className={getPartClass("botavara")}
					onClick={() => onPartClick?.("botavara")}
				/>

				{/* OBENQUES (Simplificado) */}
				<motion.path
					d="M280 100 L250 300 M280 100 L310 300"
					className={getPartClass("obenques")}
					onClick={() => onPartClick?.("obenques")}
				/>

				{/* ESTAY PROA */}
				<motion.line
					x1="280"
					y1="50"
					x2="400"
					y2="300"
					className={getPartClass("estay_proa")}
					onClick={() => onPartClick?.("estay_proa")}
				/>

				{/* ESTAY POPA / BACKSTAY */}
				<motion.line
					x1="280"
					y1="50"
					x2="100"
					y2="300"
					className={getPartClass("estay_popa")}
					onClick={() => onPartClick?.("estay_popa")}
				/>
			</g>

			{/* GROUP: VELAS */}
			<g id="sails">
				{/* MAYOR */}
				<motion.path
					d="M275 270 L140 245 L275 60 Z"
					className={`${getPartClass("mayor")} fill-white/5`}
					onClick={() => onPartClick?.("mayor")}
				/>

				{/* GENOVA */}
				<motion.path
					d="M285 290 L390 290 L285 60 Z"
					className={`${getPartClass("genova")} fill-white/5`}
					onClick={() => onPartClick?.("genova")}
				/>

				{/* SPINNAKER (Solo visible si activo) */}
				{isActive("spinnaker") && (
					<motion.path
						d="M290 290 Q450 200 290 50 Q150 200 290 290"
						className="fill-blue-400/30 stroke-blue-400 stroke-2"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
					/>
				)}
			</g>

			{/* MANIOBRA (Puntos conceptuales) */}
			<g id="deck">
				{/* DRIZA (Punto en tope de palo) */}
				<circle
					cx="280"
					cy="50"
					r="10"
					className={`cursor-pointer ${isActive("driza") ? "fill-accent animate-pulse" : "fill-transparent"}`}
					onClick={() => onPartClick?.("driza")}
				/>

				{/* ESCOTA (Punto en botavara) */}
				<circle
					cx="200"
					cy="265"
					r="8"
					className={`cursor-pointer ${isActive("escota") ? "fill-accent animate-pulse" : "fill-transparent"}`}
					onClick={() => onPartClick?.("escota")}
				/>

				{/* CONTRA (Vang) */}
				<line
					x1="240"
					y1="270"
					x2="260"
					y2="295"
					className={getPartClass("contra")}
					onClick={() => onPartClick?.("contra")}
				/>
			</g>

			{/* Labels overlay (Conceptual) */}
			<text x="50" y="480" className={textStyle}>
				ESQUEMA BÁSICO VELERO
			</text>
		</svg>
	);
}
