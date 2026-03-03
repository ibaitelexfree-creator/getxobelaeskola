"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ThreePartCard from "@/components/academy/nomenclature/ThreePartCard";
import {
	NAUTICAL_TERMS,
	NomenclatureCard,
} from "@/data/academy/nautical-nomenclature";

interface KioskNomenclatureProps {
	locale: string;
}

export default function KioskNomenclature({ locale }: KioskNomenclatureProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % NAUTICAL_TERMS.length);
		}, 8000); // 8 seconds per card

		return () => clearInterval(interval);
	}, []);

	const currentCard = NAUTICAL_TERMS[currentIndex];

	return (
		<div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-12">
			<div className="absolute top-12 left-12 text-nautical-black font-display italic text-5xl opacity-20">
				Nomenclatura Náutica
			</div>

			<div className="scale-150 transform-gpu">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentCard.id}
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: -20 }}
						transition={{ duration: 0.5 }}
					>
						<ThreePartCard card={currentCard} mode="control" locale={locale} />
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="absolute bottom-12 w-full max-w-4xl flex gap-2 justify-center">
				{NAUTICAL_TERMS.map((term, idx) => (
					<div
						key={term.id}
						className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? "w-12 bg-accent" : "w-2 bg-slate-300"}`}
					/>
				))}
			</div>
		</div>
	);
}
