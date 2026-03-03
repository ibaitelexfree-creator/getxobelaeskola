import type { Metadata } from "next";
import { MontessoriMode } from "@/components/academy/montessori/MontessoriMode";

export const metadata: Metadata = {
	title: "Exploración Libre - Montessori",
	description: "Navega tu aprendizaje a tu propio ritmo.",
};

export default function MontessoriPage() {
	return (
		<main className="min-h-screen bg-nautical-deep">
			<MontessoriMode />
		</main>
	);
}
