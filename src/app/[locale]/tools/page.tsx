"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import NauticalConverter from "@/components/tools/NauticalConverter/NauticalConverter";

export default function ToolsPage() {
	const t = useTranslations("tools");

	return (
		<main className="min-h-screen bg-nautical-deep relative overflow-hidden flex flex-col pt-32 pb-20 px-4 md:px-12">
			{/* Background Elements */}
			<div className="absolute inset-0 z-0 pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-b from-nautical-deep via-transparent to-nautical-deep z-10" />
				{/* Abstract background pattern if image fails */}
				<div className="absolute inset-0 opacity-5 bg-[url('/images/noise.png')] mix-blend-overlay" />
			</div>

			<div className="relative z-10 w-full max-w-7xl mx-auto space-y-12">
				{/* Header */}
				<div className="text-center space-y-4">
					<div className="inline-block px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm mb-4">
						<span className="text-[10px] uppercase tracking-[0.3em] font-black text-accent">
							{t("title")}
						</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-display italic text-white leading-tight">
						{t("converter.title")}
					</h1>
					<p className="text-white/40 max-w-2xl mx-auto font-light text-lg">
						{t("converter.subtitle")}
					</p>
				</div>

				{/* Tool Component */}
				<NauticalConverter />
			</div>
		</main>
	);
}
