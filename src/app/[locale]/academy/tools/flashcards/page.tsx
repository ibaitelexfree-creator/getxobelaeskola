import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import FlashcardGame from "@/components/academy/interactive/FlashcardGame";

export default function FlashcardsPage() {
	return (
		<div className="min-h-screen bg-nautical-black text-white pb-20">
			{/* Header */}
			<header className="border-b border-white/10 bg-white/5 backdrop-blur-md pt-24 pb-12">
				<div className="container mx-auto px-6">
					<Link
						href="/es/academy"
						className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors mb-6 text-sm"
					>
						<ArrowLeft className="w-4 h-4" /> Volver a la Academia
					</Link>
					<h1 className="text-4xl md:text-6xl font-display italic text-white mb-4">
						Flashcards <span className="text-accent">Náuticas</span>
					</h1>
					<p className="text-lg text-white/60 max-w-2xl font-light">
						Repasa conceptos clave de forma rápida. Luces, banderas, nudos y
						más. La repetición espaciada es clave para memorizar la normativa.
					</p>
				</div>
			</header>

			<main className="container mx-auto px-6 py-12">
				<FlashcardGame />
			</main>
		</div>
	);
}
