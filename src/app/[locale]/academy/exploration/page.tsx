"use client";

import { useTranslations } from "next-intl";
import ConstellationMap from "@/components/academy/navigation/ConstellationMap";

export default function ExplorationPage() {
	const t = useTranslations("academy"); // Assuming translation exists or fallback

	return (
		<div className="w-full h-screen relative bg-[#000510] flex flex-col items-center justify-center">
			{/* Header Overlay */}
			<div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
				<h1 className="text-3xl font-display text-white italic tracking-wide drop-shadow-lg">
					Mapa Estelar
				</h1>
				<p className="text-[10px] text-accent uppercase tracking-[0.3em] font-light mt-2">
					Navegación Libre
				</p>
			</div>

			{/* Map Component */}
			<div className="w-full h-full">
				<ConstellationMap />
			</div>

			{/* Background Effects */}
			<div className="absolute inset-0 bg-radial-gradient from-transparent to-nautical-black/80 pointer-events-none" />
		</div>
	);
}
