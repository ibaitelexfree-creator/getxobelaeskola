import {
	Anchor,
	CheckCircle,
	Flag,
	Lightbulb,
	Lock,
	Radio,
	Ship,
} from "lucide-react";
import type React from "react";
import type { MontessoriTopic } from "./types";

interface TopicCardProps {
	topic: MontessoriTopic;
	status: "locked" | "available" | "mastered" | "viewed";
	onClick: () => void;
}

const CategoryIcon: React.FC<{ category: string; className?: string }> = ({
	category,
	className,
}) => {
	switch (category) {
		case "knots":
			return <Anchor className={className} />;
		case "lights":
			return <Lightbulb className={className} />;
		case "flags":
			return <Flag className={className} />;
		case "radio":
			return <Radio className={className} />;
		default:
			return <Ship className={className} />;
	}
};

export const TopicCard: React.FC<TopicCardProps> = ({
	topic,
	status,
	onClick,
}) => {
	const isLocked = status === "locked";
	const isMastered = status === "mastered";

	return (
		<button
			onClick={onClick}
			disabled={isLocked}
			className={`
                relative group w-full text-left p-6 rounded-2xl border transition-all duration-300
                ${
									isLocked
										? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
										: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent/50 cursor-pointer hover:scale-[1.02]"
								}
                ${isMastered ? "border-emerald-500/30 bg-emerald-500/5" : ""}
            `}
		>
			<div className="flex items-start justify-between mb-4">
				<div
					className={`p-3 rounded-xl ${isMastered ? "bg-emerald-500/20 text-emerald-400" : "bg-accent/10 text-accent"}`}
				>
					<CategoryIcon category={topic.category} className="w-6 h-6" />
				</div>
				{isMastered && <CheckCircle className="w-5 h-5 text-emerald-400" />}
				{isLocked && <Lock className="w-5 h-5 text-white/30" />}
			</div>

			<h3 className="text-lg font-display text-white mb-2 line-clamp-2">
				{topic.title}
			</h3>

			<p className="text-xs text-white/50 line-clamp-3 mb-4 font-light">
				{topic.description}
			</p>

			<div className="flex items-center gap-2 mt-auto">
				<div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
					<div
						className={`h-full rounded-full ${isMastered ? "bg-emerald-500" : "bg-accent"}`}
						style={{ width: topic.difficulty * 100 + "%" }} // Just visualizing difficulty as a bar for now
					/>
				</div>
				<span className="text-[9px] uppercase tracking-wider text-white/40">
					DIFICULTAD
				</span>
			</div>
		</button>
	);
};
