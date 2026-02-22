"use client";

import { MapPin, MousePointerClick, Navigation, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ControlsProps {
	activeTool: "navigate" | "route" | "waypoint";
	onToolChange: (tool: "navigate" | "route" | "waypoint") => void;
	onClear: () => void;
}

export default function Controls({
	activeTool,
	onToolChange,
	onClear,
}: ControlsProps) {
	const t = useTranslations("nautical_chart.tools");

	return (
		<div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 bg-white/95 p-2 rounded-xl shadow-lg border border-slate-200/60 backdrop-blur-md">
			<button
				onClick={() => onToolChange("navigate")}
				className={`p-3 rounded-lg transition-all flex items-center gap-3 ${activeTool === "navigate" ? "bg-nautical-blue/10 text-nautical-blue shadow-inner font-bold ring-1 ring-nautical-blue/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
				title={t("navigate")}
			>
				<Navigation
					size={20}
					strokeWidth={activeTool === "navigate" ? 2.5 : 2}
				/>
				<span className="text-[10px] uppercase tracking-[0.1em] font-black hidden md:inline-block">
					{t("navigate")}
				</span>
			</button>
			<button
				onClick={() => onToolChange("route")}
				className={`p-3 rounded-lg transition-all flex items-center gap-3 ${activeTool === "route" ? "bg-nautical-blue/10 text-nautical-blue shadow-inner font-bold ring-1 ring-nautical-blue/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
				title={t("route")}
			>
				<MousePointerClick
					size={20}
					strokeWidth={activeTool === "route" ? 2.5 : 2}
				/>
				<span className="text-[10px] uppercase tracking-[0.1em] font-black hidden md:inline-block">
					{t("route")}
				</span>
			</button>
			<button
				onClick={() => onToolChange("waypoint")}
				className={`p-3 rounded-lg transition-all flex items-center gap-3 ${activeTool === "waypoint" ? "bg-nautical-blue/10 text-nautical-blue shadow-inner font-bold ring-1 ring-nautical-blue/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
				title={t("waypoint")}
			>
				<MapPin size={20} strokeWidth={activeTool === "waypoint" ? 2.5 : 2} />
				<span className="text-[10px] uppercase tracking-[0.1em] font-black hidden md:inline-block">
					{t("waypoint")}
				</span>
			</button>

			<div className="h-px bg-slate-200 my-1 w-full" />

			<button
				onClick={onClear}
				className="p-3 rounded-lg transition-all flex items-center gap-3 text-red-400 hover:bg-red-50 hover:text-red-600 group"
				title={t("clear")}
			>
				<Trash2
					size={20}
					className="group-hover:scale-110 transition-transform"
				/>
				<span className="text-[10px] uppercase tracking-[0.1em] font-black hidden md:inline-block">
					{t("clear")}
				</span>
			</button>
		</div>
	);
}
