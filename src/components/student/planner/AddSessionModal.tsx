import { BookOpen, Calendar, Clock, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { StudySession } from "./types";

interface AddSessionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (session: Partial<StudySession>) => Promise<void>;
	initialDate?: Date;
	initialSession?: StudySession;
	onDelete?: (id: string) => Promise<void>;
}

export default function AddSessionModal({
	isOpen,
	onClose,
	onSave,
	initialDate,
	initialSession,
	onDelete,
}: AddSessionModalProps) {
	const [topic, setTopic] = useState("");
	const [startTime, setStartTime] = useState("");
	const [duration, setDuration] = useState(60);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			if (initialSession) {
				setTopic(initialSession.topic || "");
				const d = new Date(initialSession.start_time);
				// Format for datetime-local: YYYY-MM-DDTHH:mm
				const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
					.toISOString()
					.slice(0, 16);
				setStartTime(iso);
				setDuration(initialSession.duration_minutes || 60);
			} else if (initialDate) {
				setTopic("");
				// Set to 10:00 AM of the selected day
				const d = new Date(initialDate);
				d.setHours(10, 0, 0, 0);
				const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
					.toISOString()
					.slice(0, 16);
				setStartTime(iso);
				setDuration(60);
			}
		}
	}, [isOpen, initialDate, initialSession]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await onSave({
				id: initialSession?.id,
				topic,
				start_time: new Date(startTime).toISOString(),
				duration_minutes: Number(duration),
			});
			onClose();
		} catch (error) {
			console.error(error);
			alert("Error al guardar la sesión");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!initialSession?.id || !onDelete) return;
		if (!confirm("¿Estás seguro de eliminar esta sesión?")) return;
		setLoading(true);
		try {
			await onDelete(initialSession.id);
			onClose();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
			<div className="bg-nautical-black border border-white/10 w-full max-w-md rounded-sm shadow-2xl overflow-hidden relative">
				<div className="absolute top-0 left-0 w-full h-1 bg-accent/50" />

				<div className="flex justify-between items-center p-6 border-b border-white/5">
					<h2 className="text-lg font-display text-white italic">
						{initialSession ? "Editar Sesión" : "Planificar Sesión"}
					</h2>
					<button
						onClick={onClose}
						className="text-white/40 hover:text-white transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="space-y-2">
						<label className="text-[10px] uppercase tracking-widest text-accent font-bold flex items-center gap-2">
							<BookOpen size={12} /> Tema de Estudio
						</label>
						<input
							type="text"
							required
							className="w-full bg-white/5 border border-white/10 rounded-sm p-3 text-white placeholder-white/20 focus:border-accent outline-none transition-colors"
							placeholder="Ej. Navegación, Meteorología..."
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-[10px] uppercase tracking-widest text-accent font-bold flex items-center gap-2">
								<Calendar size={12} /> Fecha y Hora
							</label>
							<input
								type="datetime-local"
								required
								className="w-full bg-white/5 border border-white/10 rounded-sm p-3 text-white focus:border-accent outline-none transition-colors"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-[10px] uppercase tracking-widest text-accent font-bold flex items-center gap-2">
								<Clock size={12} /> Duración (min)
							</label>
							<input
								type="number"
								required
								min="15"
								step="15"
								className="w-full bg-white/5 border border-white/10 rounded-sm p-3 text-white focus:border-accent outline-none transition-colors"
								value={duration}
								onChange={(e) => setDuration(Number(e.target.value))}
							/>
						</div>
					</div>

					<div className="pt-4 flex gap-3">
						{initialSession && onDelete && (
							<button
								type="button"
								onClick={handleDelete}
								disabled={loading}
								className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
							>
								Eliminar
							</button>
						)}
						<button
							type="submit"
							disabled={loading}
							className="flex-1 px-4 py-3 bg-accent text-nautical-black hover:bg-white text-xs font-black uppercase tracking-widest rounded-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
						>
							{loading ? "Guardando..." : "Guardar Sesión"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
