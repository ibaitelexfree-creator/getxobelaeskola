import { ArrowRight, Sparkles } from "lucide-react";
import type React from "react";
import type { MontessoriTopic } from "./types";

interface RecommendationBannerProps {
	topic: MontessoriTopic | null;
	onStart: () => void;
}

export const RecommendationBanner: React.FC<RecommendationBannerProps> = ({
	topic,
	onStart,
}) => {
	if (!topic) return null;

	return (
		<div
			className="w-full relative overflow-hidden rounded-3xl p-8 mb-12 border border-accent/20 group cursor-pointer"
			onClick={onStart}
		>
			{/* Background Effects */}
			<div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
			<div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

			<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-4">
						<span className="px-3 py-1 rounded-full bg-accent text-nautical-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
							<Sparkles size={12} />
							Recomendado para ti
						</span>
						<span className="text-accent/60 text-xs uppercase tracking-wider font-bold">
							Basado en tu progreso
						</span>
					</div>

					<h2 className="text-3xl font-display italic text-white mb-2">
						{topic.title}
					</h2>

					<p className="text-white/70 max-w-xl font-light leading-relaxed line-clamp-2">
						{topic.description}
					</p>
				</div>

				<button
					onClick={(e) => {
						e.stopPropagation();
						onStart();
					}}
					className="flex-shrink-0 px-8 py-4 bg-accent hover:bg-white text-nautical-black font-black uppercase tracking-widest text-xs rounded-lg transition-all transform group-hover:translate-x-1 flex items-center gap-2"
				>
					Comenzar
					<ArrowRight size={16} />
				</button>
			</div>
		</div>
	);
};
