import React from "react";
import { TideLabContainer } from "@/components/academy/tide-lab/TideLabContainer";

export const metadata = {
	title: "Lab de Mareas | Academy",
	description:
		"Simulación interactiva de mareas y corrientes en el Abra de Bilbao.",
};

export default function LabPage() {
	return (
		<main className="min-h-screen bg-slate-950">
			<TideLabContainer />
		</main>
	);
}
