"use client";

import type React from "react";
import { useMemo } from "react";
import { getRecommendation } from "@/lib/academy/montessori-ml";
import { useMontessoriStore } from "@/lib/store/useMontessoriStore";
import { getAllTopics } from "./data-adapter";
import { MontessoriExplorer } from "./MontessoriExplorer";

export const MontessoriMode: React.FC = () => {
	const { history, ability, recordInteraction } = useMontessoriStore();

	const topics = useMemo(() => getAllTopics(), []);

	const recommendedTopic = useMemo(() => {
		return getRecommendation(topics, history, ability);
	}, [topics, history, ability]);

	return (
		<div className="container mx-auto px-6 py-12 min-h-screen">
			<header className="mb-12">
				<span className="text-accent uppercase tracking-[1em] text-[10px] font-black block mb-4">
					Modo Exploración
				</span>
				<h1 className="text-4xl md:text-6xl font-display italic text-white mb-4">
					Aprendizaje <span className="text-accent">Montessori</span>
				</h1>
				<p className="text-white/60 font-light max-w-2xl leading-relaxed">
					Navega libremente por los conceptos náuticos. El sistema adaptará las
					recomendaciones según tu progreso y ritmo de aprendizaje.
				</p>

				{/* Visual Ability Indicator */}
				<div className="mt-8 inline-flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10">
					<span className="text-[10px] uppercase tracking-widest text-white/40">
						Nivel de Habilidad
					</span>
					<div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-accent/50 to-accent"
							style={{ width: `${ability * 100}%` }}
						/>
					</div>
					<span className="font-mono text-accent text-sm">
						{Math.round(ability * 100)}%
					</span>
				</div>
			</header>

			<MontessoriExplorer
				topics={topics}
				history={history}
				ability={ability}
				recommendedTopic={recommendedTopic}
				onRecordInteraction={recordInteraction}
			/>
		</div>
	);
};
