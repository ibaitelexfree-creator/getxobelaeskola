import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useMissionStore } from "./store";

interface Props {
	title: string;
	timerSeconds: number;
}

export const MissionHeader: React.FC<Props> = ({ title, timerSeconds }) => {
	const { status, score, currentStep, totalSteps, failMission } =
		useMissionStore();
	const [timeLeft, setLeft] = useState(timerSeconds);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Initial timer setup
	useEffect(() => {
		setLeft(timerSeconds);
	}, [timerSeconds, status]);

	// Countdown logic
	useEffect(() => {
		if (status !== "playing" || timeLeft <= 0 || !timerSeconds) {
			if (timerRef.current) clearInterval(timerRef.current);
			return;
		}

		timerRef.current = setInterval(() => {
			setLeft((prev) => {
				if (prev <= 1) {
					if (timerRef.current) clearInterval(timerRef.current);
					failMission("¡TIEMPO AGOTADO!");
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [status, timerSeconds, failMission, timeLeft]);

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	if (status === "idle") return null;

	const isUrgent = timeLeft < 10 && timerSeconds > 0;

	return (
		<div className="relative px-6 py-4 border-b border-white/10 bg-nautical-black/40 backdrop-blur-md flex items-center justify-between overflow-hidden">
			{/* Background Glow for Urgency */}
			<AnimatePresence>
				{isUrgent && status === "playing" && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-red-600 pointer-events-none"
					/>
				)}
			</AnimatePresence>

			<div className="flex items-center gap-4 relative z-10">
				<div className="flex flex-col">
					<span className="text-3xs uppercase tracking-[0.2em] text-accent font-black mb-0.5">
						Misión Activa
					</span>
					<h3 className="text-lg font-display italic text-white flex items-center gap-2">
						{title}
						<span className="text-white/20 not-italic text-sm font-light">
							{currentStep + 1} / {totalSteps}
						</span>
					</h3>
				</div>
			</div>

			<div className="flex items-center gap-6 relative z-10">
				{/* Score Display */}
				<div className="text-right hidden sm:block">
					<span className="text-3xs uppercase tracking-widest text-white/40 block mb-1">
						Puntuación
					</span>
					<motion.span
						key={score}
						initial={{ scale: 1.2, color: "#fff" }}
						animate={{ scale: 1, color: "var(--color-accent)" }}
						className="text-xl font-mono font-black text-accent"
					>
						{Math.floor(score).toString().padStart(3, "0")}
					</motion.span>
				</div>

				{/* Timer Counter */}
				{timerSeconds > 0 && (
					<div className="flex flex-col items-end">
						<span
							className={`text-3xs uppercase tracking-widest block mb-1 ${isUrgent ? "text-red-400" : "text-white/40"}`}
						>
							Tiempo
						</span>
						<motion.div
							animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
							transition={{ repeat: Infinity, duration: 0.5 }}
							className={`
                                px-4 py-1.5 rounded-sm font-mono font-black text-lg border
                                ${
																	isUrgent
																		? "bg-red-500/20 border-red-500/50 text-red-500"
																		: "bg-white/5 border-white/10 text-white"
																}
                            `}
						>
							{formatTime(timeLeft)}
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
};
