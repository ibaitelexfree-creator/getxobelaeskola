"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function NotFound() {
	const t = useTranslations("errors.404");
	const locale = useLocale();

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
	const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			mouseX.set(e.clientX - window.innerWidth / 2);
			mouseY.set(e.clientY - window.innerHeight / 2);
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mouseX, mouseY]);

	return (
		<div className="min-h-screen bg-nautical-black flex items-center justify-center p-6 text-center relative overflow-hidden">
			{/* Interactive Background Glow */}
			<motion.div
				style={{ x: springX, y: springY }}
				className="absolute inset-0 z-0 pointer-events-none"
			>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px] opacity-50" />
			</motion.div>

			{/* Background effects */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
			<div
				className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brass-gold/5 rounded-full blur-[120px] animate-pulse"
				style={{ animationDelay: "2s" }}
			/>
			<div className="bg-mesh" />

			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 1.2, ease: "easeOut" }}
				className="max-w-xl w-full space-y-8 relative z-10"
			>
				{/* 3D Icon or Large Emoji */}
				<motion.div
					animate={{ rotate: [0, -2, 2, 0] }}
					transition={{ duration: 6, repeat: Infinity }}
					className="relative inline-block"
				>
					<div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
					<div className="relative w-32 h-32 md:w-40 md:h-40 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-2xl backdrop-blur-sm mx-auto animate-bounce-slow">
						⚓
					</div>
				</motion.div>

				<div className="space-y-4">
					<p className="text-accent uppercase tracking-[0.4em] text-[10px] font-black opacity-60">
						{t("code")}
					</p>
					<h1 className="text-5xl md:text-7xl font-display italic text-white tracking-tighter">
						{t("title")}
					</h1>
					<p className="text-xl md:text-2xl text-white/80 font-medium font-display italic">
						{t("subtitle")}
					</p>
					<p className="text-white/40 text-sm md:text-base max-w-md mx-auto leading-relaxed font-light">
						{t("description")}
					</p>
				</div>

				<div className="pt-8">
					<Link
						href={`/${locale}`}
						className="inline-flex items-center justify-center px-10 py-5 bg-accent hover:bg-white text-nautical-black rounded-sm font-bold text-xs uppercase tracking-widest shadow-2xl shadow-accent/20 transition-all active:scale-95 group"
					>
						<span className="mr-3 group-hover:-translate-x-1 transition-transform">
							←
						</span>
						{t("back_button")}
					</Link>
				</div>

				{/* Aesthetic Nautical Coordinates */}
				<div className="pt-12 flex items-center justify-center gap-6 opacity-20">
					<div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/30" />
					<span className="text-[10px] font-mono whitespace-nowrap tracking-widest uppercase">
						43.3444° N, 3.0125° W • PUERTO DE GETXO
					</span>
					<div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/30" />
				</div>
			</motion.div>
		</div>
	);
}
