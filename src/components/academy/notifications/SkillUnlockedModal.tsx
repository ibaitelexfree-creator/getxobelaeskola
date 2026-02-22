"use client";

import React, { useEffect, useState } from "react";
import { useNotificationStore } from "@/lib/store/useNotificationStore";

export default function SkillUnlockedModal() {
	const notifications = useNotificationStore((state) => state.notifications);
	const removeNotification = useNotificationStore(
		(state) => state.removeNotification,
	);

	const skillNotifications = notifications.filter((n) => n.type === "skill");
	const currentSkill = skillNotifications[0];

	if (!currentSkill) return null;

	return (
		<SkillModal
			notification={currentSkill}
			onClose={() => removeNotification(currentSkill.id)}
		/>
	);
}

interface SkillModalProps {
	notification: {
		id: string;
		title: string;
		message: string;
		icon?: string;
		data?: {
			category?: string;
		};
	};
	onClose: () => void;
}

function SkillModal({ notification, onClose }: SkillModalProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [confettiPieces, setConfettiPieces] = useState<
		Array<{
			id: number;
			left: number;
			delay: number;
			duration: number;
			rotation: number;
			color: string;
		}>
	>([]);

	useEffect(() => {
		// Entry animation
		setTimeout(() => setIsVisible(true), 100);

		// Generate confetti
		const pieces = Array.from({ length: 50 }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			delay: Math.random() * 0.5,
			duration: 2 + Math.random() * 2,
			rotation: Math.random() * 360,
			color: ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"][
				Math.floor(Math.random() * 5)
			],
		}));
		setConfettiPieces(pieces);

		// Auto close after 5 seconds
		const timer = setTimeout(onClose, 5000);
		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
					isVisible ? "opacity-100" : "opacity-0"
				}`}
				onClick={onClose}
			/>

			{/* Confetti */}
			<div className="fixed inset-0 z-[101] pointer-events-none overflow-hidden">
				{confettiPieces.map((piece) => (
					<div
						key={piece.id}
						className="absolute w-3 h-3 animate-confetti"
						style={{
							left: `${piece.left}%`,
							top: "-10%",
							backgroundColor: piece.color,
							animationDelay: `${piece.delay}s`,
							animationDuration: `${piece.duration}s`,
							transform: `rotate(${piece.rotation}deg)`,
						}}
					/>
				))}
			</div>

			{/* Modal */}
			<div
				className="fixed inset-0 z-[102] flex items-center justify-center p-6"
				role="dialog"
				aria-modal="true"
				aria-labelledby="skill-modal-title"
			>
				<div
					className={`
                        relative
                        bg-gradient-to-br from-nautical-black via-[#0d1829] to-nautical-black
                        border-2 border-accent/40
                        rounded-3xl
                        p-12
                        max-w-lg w-full
                        shadow-[0_0_80px_rgba(255,184,0,0.3)]
                        transition-all duration-700 ease-out
                        focus:outline-none focus:ring-2 focus:ring-accent/50
                        ${isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"}
                    `}
					tabIndex={-1}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							onClose();
						}
					}}
				>
					{/* Glow effect */}
					<div className="absolute -inset-1 bg-gradient-to-r from-accent via-yellow-400 to-accent rounded-3xl opacity-20 blur-2xl animate-pulse" />

					{/* Content */}
					<div className="relative text-center space-y-6">
						{/* Badge Label */}
						<div className="text-3xs uppercase font-black tracking-[0.3em] text-accent">
							⚡ Habilidad Desbloqueada
						</div>

						{/* Icon */}
						<div className="relative inline-block">
							<div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-accent to-yellow-600 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(255,184,0,0.5)] animate-pulse-slow">
								{notification.icon || "✨"}
							</div>
							{/* Ring animation */}
							<div className="absolute inset-0 rounded-full border-4 border-accent animate-ping opacity-20" />
							<div className="absolute inset-4 rounded-full border-2 border-yellow-400 animate-spin-slow opacity-30" />
						</div>

						{/* Title */}
						<h2
							id="skill-modal-title"
							className="text-4xl font-display italic text-white leading-tight"
						>
							{notification.title}
						</h2>

						{/* Description */}
						<p className="text-white/70 text-lg leading-relaxed max-w-md mx-auto">
							{notification.message}
						</p>

						{/* Stats */}
						{notification.data?.category && (
							<div className="flex items-center justify-center gap-3">
								<span className="px-4 py-2 rounded-full bg-accent/20 border border-accent/40 text-accent text-sm font-bold uppercase tracking-wider">
									{notification.data.category}
								</span>
							</div>
						)}

						{/* Close Button */}
						<button
							onClick={onClose}
							className="mt-8 px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white transition-all shadow-xl shadow-accent/30 hover:scale-105"
						>
							¡Genial! 🎉
						</button>
					</div>

					{/* Close icon */}
					<button
						onClick={onClose}
						className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
					>
						✕
					</button>
				</div>
			</div>
		</>
	);
}
