"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function AcademyError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("errors.500");
	const locale = useLocale();

	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Academy Error Boundary:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-nautical-black flex items-center justify-center p-6 text-center relative overflow-hidden">
			{/* Background effects */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
			<div
				className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse"
				style={{ animationDelay: "2s" }}
			/>
			<div className="bg-mesh" />

			<div className="max-w-xl w-full space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
				<div className="relative inline-block">
					<div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
					<div className="relative w-32 h-32 md:w-40 md:h-40 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-2xl backdrop-blur-sm mx-auto animate-bounce-slow text-red-500">
						⚓
					</div>
				</div>

				<div className="space-y-4">
					<p className="text-red-500 uppercase tracking-[0.4em] text-[10px] font-black opacity-60">
						ACADEMY ERROR
					</p>
					<h1 className="text-5xl md:text-7xl font-display italic text-white tracking-tighter">
						Tempestad Digital
					</h1>
					<p className="text-xl md:text-2xl text-white/80 font-medium font-display italic">
						La sala de máquinas ha reportado un fallo.
					</p>
					<p className="text-white/40 text-sm md:text-base max-w-md mx-auto leading-relaxed font-light">
						Hubo un problema al cargar el contenido académico. No te preocupes,
						tu progreso está a salvo.
					</p>
				</div>

				<div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
					<button
						onClick={() => reset()}
						className="inline-flex items-center justify-center px-10 py-5 bg-accent text-nautical-black border border-accent rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white hover:border-white transition-all shadow-2xl shadow-accent/20"
					>
						INTENTAR DE NUEVO ⟳
					</button>
					<Link
						href={`/${locale}/academy/dashboard`}
						className="inline-flex items-center justify-center px-10 py-5 bg-white/5 border border-white/10 text-white rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-sm"
					>
						VOLVER AL PANEL
					</Link>
				</div>

				{/* Aesthetic Nautical Coordinates */}
				<div className="pt-12 flex items-center justify-center gap-6 opacity-20">
					<div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/30" />
					<span className="text-[10px] font-mono whitespace-nowrap tracking-widest uppercase">
						FALLO EN BITÁCORA • GETXO RADAR
					</span>
					<div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/30" />
				</div>
			</div>
		</div>
	);
}
