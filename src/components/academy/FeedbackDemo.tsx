"use client";

import React from "react";
import { useAcademyFeedback } from "@/hooks/useAcademyFeedback";

/**
 * DEMO: FeedbackDemo - Component to test the feedback system
 * This shows how to integrate the feedback system in your components
 */
export default function FeedbackDemo() {
	const { showAchievement, showSkillUnlocked, showMessage } =
		useAcademyFeedback();

	const testAchievement = () => {
		showAchievement({
			id: "primer-dia",
			nombre_es: "Primer Día en el Mar",
			nombre_eu: "Lehen Eguna Itsasoan",
			descripcion_es: "Has completado tu primera unidad. ¡Bienvenido a bordo!",
			icono: "⚓",
			rareza: "comun",
			puntos: 10,
		});
	};

	const testLegendaryAchievement = () => {
		showAchievement({
			id: "capitan",
			nombre_es: "Capitán de los Siete Mares",
			nombre_eu: "Zazpi Itsasoen Kapitaina",
			descripcion_es:
				"¡Has completado los 7 niveles de formación! Eres un verdadero maestro de la vela.",
			icono: "👑",
			rareza: "legendario",
			puntos: 500,
		});
	};

	const testSkill = () => {
		showSkillUnlocked({
			id: "skill-nudos",
			name: "Maestro de Nudos",
			description:
				"Dominas los nudos marineros fundamentales para la navegación segura.",
			icon: "🪢",
			category: "Técnica",
		});
	};

	const testMessage = () => {
		showMessage(
			"¡Excelente navegación!",
			"Has completado esta unidad con gran destreza.",
			"success",
			"✨",
		);
	};

	return (
		<div className="fixed bottom-4 left-4 z-50 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-2">
			<div className="text-3xs font-black uppercase tracking-wider text-white/40 mb-3">
				📢 Feedback Demo
			</div>
			<button
				onClick={testAchievement}
				className="block w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 text-blue-300 text-2xs font-bold rounded transition-all"
			>
				Logro Común
			</button>
			<button
				onClick={testLegendaryAchievement}
				className="block w-full px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-400/30 text-yellow-300 text-2xs font-bold rounded transition-all"
			>
				Logro Legendario
			</button>
			<button
				onClick={testSkill}
				className="block w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/30 text-purple-300 text-2xs font-bold rounded transition-all"
			>
				Habilidad Desbloqueada
			</button>
			<button
				onClick={testMessage}
				className="block w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/40 border border-green-400/30 text-green-300 text-2xs font-bold rounded transition-all"
			>
				Mensaje Simple
			</button>
		</div>
	);
}
