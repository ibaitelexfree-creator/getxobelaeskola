"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ThreePartCard from "@/components/academy/nomenclature/ThreePartCard";
import { NAUTICAL_TERMS } from "@/data/academy/nautical-nomenclature";

interface KioskNomenclatureSlideProps {
	locale: string;
}

export default function KioskNomenclatureSlide({
	locale,
}: KioskNomenclatureSlideProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const terms = NAUTICAL_TERMS;

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % terms.length);
		}, 5000); // Change every 5 seconds

		return () => clearInterval(timer);
	}, [terms.length]);

	const currentCard = terms[currentIndex];

	return (
		<div className="w-full h-full flex flex-col items-center justify-center bg-nautical-black relative p-12 overflow-hidden">
			<div className="absolute inset-0 bg-[url('/images/topo-pattern.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

			<motion.h2
				key={currentIndex}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-4xl text-white/40 font-display mb-16 uppercase tracking-[0.3em] z-10 text-center absolute top-12"
			>
				Nomenclatura Náutica
			</motion.h2>

			<div
				className="relative w-full h-full flex items-center justify-center z-10"
				style={{ perspective: "1500px" }}
			>
				<AnimatePresence mode="wait">
					<motion.div
						key={currentCard.id}
						initial={{ rotateY: 90, opacity: 0 }}
						animate={{ rotateY: 0, opacity: 1 }}
						exit={{ rotateY: -90, opacity: 0 }}
						transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
						className="origin-center"
						style={{ transformStyle: "preserve-3d" }}
					>
						{/* Scale up the card because the original component is fixed size (w-56) */}
						<div className="transform scale-[2.0] origin-center shadow-2xl rounded-xl">
							<ThreePartCard
								card={currentCard}
								mode="control"
								locale={locale}
							/>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="absolute bottom-24 flex gap-2 z-10">
				{terms.map((_, idx) => (
					<div
						key={idx}
						className={`w-2 h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? "bg-accent scale-150" : "bg-white/10"}`}
					/>
				))}
			</div>
		</div>
	);
}
