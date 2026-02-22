import { CheckCircle, Circle, Lock, RotateCw, Unlock } from "lucide-react";
import Link from "next/link";
import type React from "react";

export type UnlockStatus =
	| "locked"
	| "bloqueado"
	| "available"
	| "no_iniciado"
	| "in_progress"
	| "en_progreso"
	| "completed"
	| "completado";

export interface UnlockStatusResponse {
	niveles: Record<string, UnlockStatus>;
	cursos: Record<string, UnlockStatus>;
	modulos: Record<string, UnlockStatus>;
	unidades: Record<string, UnlockStatus>;
}

interface UnlockStatusBadgeProps {
	status: UnlockStatus;
	className?: string;
}

const statusConfig: Record<
	string,
	{ icon: React.ReactNode; label: string; color: string; bg: string }
> = {
	locked: {
		icon: <Lock className="w-4 h-4" />,
		label: "Bloqueado",
		color: "text-gray-300",
		bg: "bg-gray-100/10 border-gray-500/20",
	},
	bloqueado: {
		icon: <Lock className="w-4 h-4" />,
		label: "Bloqueado",
		color: "text-gray-300",
		bg: "bg-gray-100/10 border-gray-500/20",
	},
	available: {
		icon: <Unlock className="w-4 h-4" />,
		label: "Disponible",
		color: "text-blue-300",
		bg: "bg-blue-500/10 border-blue-500/20",
	},
	no_iniciado: {
		icon: <Circle className="w-4 h-4" />,
		label: "Disponible",
		color: "text-blue-300",
		bg: "bg-blue-500/10 border-blue-500/20",
	},
	in_progress: {
		icon: <RotateCw className="w-4 h-4 animate-spin-slow" />,
		label: "En Progreso",
		color: "text-amber-300",
		bg: "bg-amber-500/10 border-amber-500/20",
	},
	en_progreso: {
		icon: <RotateCw className="w-4 h-4 animate-spin-slow" />,
		label: "En Progreso",
		color: "text-amber-300",
		bg: "bg-amber-500/10 border-amber-500/20",
	},
	completed: {
		icon: <CheckCircle className="w-4 h-4" />,
		label: "Completado",
		color: "text-green-300",
		bg: "bg-green-500/10 border-green-500/20",
	},
	completado: {
		icon: <CheckCircle className="w-4 h-4" />,
		label: "Completado",
		color: "text-green-300",
		bg: "bg-green-500/10 border-green-500/20",
	},
};

export const UnlockStatusBadge: React.FC<UnlockStatusBadgeProps> = ({
	status,
	className = "",
}) => {
	// Normalize status to handle API variations if any, though config covers them
	const config = statusConfig[status] || statusConfig.locked;
	const isLocked = status === "locked" || status === "bloqueado";

	return (
		<div
			className={`
                inline-flex items-center gap-2 px-3 py-1 rounded-full text-3xs font-black uppercase tracking-widest border transition-all duration-300
                ${config.color} ${config.bg} ${className}
                ${status === "completed" || status === "completado" ? "shadow-[0_0_12px_rgba(74,222,128,0.2)] animate-pulse" : ""}
                ${isLocked ? "cursor-not-allowed opacity-80 hover:opacity-100 hover:bg-white/5 hover:border-white/10 hover:text-white" : ""}
            `}
			title={
				isLocked
					? "Completa el contenido anterior para desbloquear"
					: config.label
			}
		>
			<span className="flex-shrink-0" aria-hidden="true">
				{config.icon}
			</span>
			<span className="leading-none pt-0.5">{config.label}</span>
		</div>
	);
};

export const LockedContentOverlay: React.FC<{
	title?: string;
	message?: string;
	onBack?: () => void;
	backPath?: string;
}> = ({
	title = "Contenido Bloqueado",
	message = "Debes completar las secciones anteriores para acceder a este contenido.",
	backPath = "/academy",
}) => {
	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
			<div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mb-6">
				<Lock className="w-10 h-10 text-white/40" />
			</div>
			<h2 className="text-3xl font-display italic text-white mb-4">{title}</h2>
			<p className="text-white/60 max-w-md mb-8 leading-relaxed">{message}</p>
			<Link
				href={backPath}
				className="px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest text-2xs rounded-sm hover:bg-white transition-colors"
			>
				Volver
			</Link>
		</div>
	);
};
