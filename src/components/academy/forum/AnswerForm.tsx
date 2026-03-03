"use client";

import type React from "react";
import { useState } from "react";
import { apiUrl } from "@/lib/api";

interface AnswerFormProps {
	preguntaId: string;
	onSuccess: (answer: any) => void;
	onCancel: () => void;
}

export default function AnswerForm({
	preguntaId,
	onSuccess,
	onCancel,
}: AnswerFormProps) {
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await fetch(apiUrl("/api/forum/answers"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					pregunta_id: preguntaId,
					contenido: content,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Error creating answer");
			}

			onSuccess(data.answer);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-8 animate-fade-in bg-white/[0.02] p-6 rounded-lg border border-white/5"
		>
			<h4 className="text-sm uppercase tracking-widest text-white/70 font-bold mb-4">
				Tu Respuesta
			</h4>

			{error && (
				<div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded text-red-200 text-xs">
					{error}
				</div>
			)}

			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="Escribe tu respuesta aquí..."
				required
				rows={4}
				className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-y min-h-[100px] mb-4"
			/>

			<div className="flex justify-end gap-3">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
					disabled={loading}
				>
					Cancelar
				</button>
				<button
					type="submit"
					className="px-6 py-2 bg-white text-nautical-black font-black uppercase tracking-widest text-[10px] rounded hover:bg-accent transition-all disabled:opacity-50"
					disabled={loading}
				>
					{loading ? "Enviando..." : "Enviar Respuesta"}
				</button>
			</div>
		</form>
	);
}
