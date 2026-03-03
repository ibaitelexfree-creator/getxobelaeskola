"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareProfileButton({ userId }: { userId: string }) {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		// Use current URL or construct one
		const url = typeof window !== "undefined" ? window.location.href : "";

		if (navigator.share) {
			try {
				await navigator.share({
					title: "Perfil de Navegante - Getxo Bela Eskola",
					text: "Mira mi progreso y bitácora en Getxo Bela Eskola.",
					url: url,
				});
			} catch (error) {
				console.log("Error sharing", error);
			}
		} else {
			// Fallback to clipboard
			try {
				await navigator.clipboard.writeText(url);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error("Failed to copy", err);
			}
		}
	};

	return (
		<button
			onClick={handleShare}
			className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all group"
		>
			{copied ? (
				<Check size={16} className="text-green-400" />
			) : (
				<Share2
					size={16}
					className="group-hover:scale-110 transition-transform"
				/>
			)}
			{copied ? "Enlace Copiado" : "Compartir"}
		</button>
	);
}
