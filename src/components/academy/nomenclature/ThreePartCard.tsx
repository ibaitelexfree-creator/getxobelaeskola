"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React from "react";
import type { NomenclatureCard } from "@/data/academy/nautical-nomenclature";

interface ThreePartCardProps {
	card: NomenclatureCard;
	mode: "control" | "split" | "definition"; // control=whole, split=image+label separated
	locale: string;
	isMatched?: boolean;
	onDragStart?: (type: "label" | "image" | "definition", id: string) => void;
}

export default function ThreePartCard({
	card,
	mode,
	locale,
	isMatched,
	onDragStart,
}: ThreePartCardProps) {
	const term = locale === "eu" ? card.term_eu : card.term_es;
	const definition = locale === "eu" ? card.definition_eu : card.definition_es;

	// Base Boat Illustration as Context
	const BoatContext = (
		<g stroke="#e2e8f0" strokeWidth="1" fill="none">
			{/* Simple Boat Outline */}
			<path d="M100,20 C140,20 160,80 160,140 C160,180 140,200 100,200 C60,200 40,180 40,140 C40,80 60,20 100,20 Z" />
			<line x1="100" y1="20" x2="100" y2="200" strokeDasharray="2,2" />
		</g>
	);

	const SvgContent = card.svgPath ? (
		<g>
			{card.category !== "orientation" && BoatContext}
			<path
				d={card.svgPath}
				fill={isMatched || mode === "control" ? "#3b82f6" : "none"}
				stroke="#1e3a8a"
				strokeWidth="3"
				className="transition-all duration-500"
			/>
		</g>
	) : (
		<g stroke="#94a3b8" strokeWidth="2" fill="none">
			<path d="M100,50 C150,50 180,100 180,150 C180,220 100,280 100,280 C100,280 20,220 20,150 C20,100 50,50 100,50 Z" />
			<text
				x="100"
				y="150"
				textAnchor="middle"
				fontSize="40"
				fill="#cbd5e1"
				opacity="0.4"
			>
				?
			</text>
		</g>
	);

	if (mode === "control") {
		return (
			<div className="w-56 h-80 bg-white border border-black/10 rounded-xl shadow-lg flex flex-col overflow-hidden select-none hover:shadow-2xl transition-all hover:-translate-y-1">
				{/* Image Part */}
				<div className="h-44 bg-slate-50 flex items-center justify-center border-b border-black/5 relative p-4">
					<svg viewBox="0 0 200 220" className="w-full h-full">
						{SvgContent}
					</svg>
				</div>
				{/* Label Part */}
				<div className="h-12 flex items-center justify-center font-display text-lg font-bold text-nautical-black bg-white border-b border-black/5">
					{term}
				</div>
				{/* Definition Part */}
				<div className="flex-grow p-3 flex items-center justify-center text-center">
					<p className="text-2xs leading-relaxed text-slate-500 font-medium">
						{definition}
					</p>
				</div>
			</div>
		);
	}

	if (mode === "split") {
		return (
			<div className="flex flex-col gap-4 items-center">
				<div
					className={`w-48 h-48 bg-white border-2 ${isMatched ? "border-blue-500 bg-blue-50/30" : "border-dashed border-black/10"} rounded-xl shadow-sm flex items-center justify-center p-4 transition-all duration-500`}
				>
					<svg viewBox="0 0 200 220" className="w-full h-full opacity-90">
						{SvgContent}
					</svg>
					{isMatched && (
						<div className="absolute inset-0 flex items-center justify-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="bg-blue-500 text-white p-1 rounded-full"
							>
								<Check size={20} />
							</motion.div>
						</div>
					)}
				</div>
			</div>
		);
	}

	if (mode === "definition") {
		return (
			<div
				className={`w-full p-4 bg-white rounded-lg border-2 ${isMatched ? "border-blue-500" : "border-dashed border-slate-200"} transition-all`}
			>
				<p className="text-2xs text-slate-600 text-center leading-relaxed">
					{definition}
				</p>
			</div>
		);
	}

	return null;
}
