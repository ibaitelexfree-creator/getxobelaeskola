import type { Metadata } from "next";
import RegattaPlayer from "@/components/academy/exploration/RegattaPlayer";

export const metadata: Metadata = {
	title: "Exploración de Regatas Históricas | Academy",
	description:
		"Revive las regatas más famosas de la historia. Mapas interactivos, datos y condiciones meteorológicas.",
};

export default function HistoricalRegattasPage() {
	return (
		<main className="w-full h-screen overflow-hidden">
			<RegattaPlayer />
		</main>
	);
}
