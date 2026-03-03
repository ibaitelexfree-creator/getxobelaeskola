import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import React from "react";
import GlossarySearch from "@/components/academy/glossary/GlossarySearch";

export const metadata: Metadata = {
	title: "Glosario Náutico | Academia",
	description:
		"Diccionario completo de términos náuticos, maniobras y partes del barco.",
};

interface GlossaryPageProps {
	params: {
		locale: string;
	};
}

export default function GlossaryPage({
	params: { locale },
}: GlossaryPageProps) {
	const t = useTranslations("glossary");

	return (
		<div className="min-h-screen bg-nautical-black text-white pb-20">
			{/* Header */}
			<div className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-b from-ocean-dark/50 to-transparent">
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow"></div>
					<div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ocean-light/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
				</div>

				<div className="container mx-auto px-6 relative z-10 text-center">
					<div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-6">
						<BookOpen className="w-8 h-8 text-accent" />
					</div>
					<h1 className="text-4xl md:text-6xl font-display italic mb-6">
						{t("title").split(" ")[0]}{" "}
						<span className="text-accent">{t("title").split(" ")[1]}</span>
					</h1>
					<p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
						{t("description")}
					</p>
				</div>
			</div>

			{/* Main Content */}
			<main className="container mx-auto px-6">
				<GlossarySearch locale={locale} />
			</main>
		</div>
	);
}
