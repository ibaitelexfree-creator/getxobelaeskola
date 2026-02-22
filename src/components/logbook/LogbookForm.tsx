"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { LogbookFormData } from "@/types/logbook";

interface LogbookFormProps {
	onSuccess?: () => void;
}

export default function LogbookForm({ onSuccess }: LogbookFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LogbookFormData>({
		defaultValues: {
			fecha: new Date().toISOString().split("T")[0], // YYYY-MM-DD
			viento_nudos: 0,
			estado_animo: "discovery",
		},
	});

	const onSubmit = async (data: LogbookFormData) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const response = await fetch("/api/logbook/diary", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Error al guardar la entrada");
			}

			reset();
			if (onSuccess) onSuccess();
			router.refresh();
		} catch (err: any) {
			console.error("Logbook Error:", err);
			setError(err.message || "Error desconocido");
		} finally {
			setIsSubmitting(false);
		}
	};

	const inputClass =
		"w-full bg-nautical-deep border-b border-white/10 focus:border-accent outline-none p-3 text-sea-foam font-light transition-colors placeholder-white/20";
	const labelClass =
		"text-xs uppercase tracking-widest text-accent font-semibold ml-1 mb-1 block";

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 bg-navy-800/50 p-6 rounded-lg border border-white/5"
		>
			<h3 className="text-xl font-display text-white mb-4">
				Nueva Salida al Mar
			</h3>

			{/* Fecha y Puerto */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label htmlFor="fecha" className={labelClass}>
						Fecha
					</label>
					<input
						id="fecha"
						type="date"
						{...register("fecha", { required: "La fecha es obligatoria" })}
						className={inputClass}
					/>
					{errors.fecha && (
						<p className="text-xs text-red-500 mt-1">{errors.fecha.message}</p>
					)}
				</div>
				<div>
					<label htmlFor="puerto_salida" className={labelClass}>
						Puerto de Salida
					</label>
					<input
						id="puerto_salida"
						type="text"
						placeholder="Ej: Getxo Kaia"
						{...register("puerto_salida", {
							required: "El puerto es obligatorio",
						})}
						className={inputClass}
					/>
					{errors.puerto_salida && (
						<p className="text-xs text-red-500 mt-1">
							{errors.puerto_salida.message}
						</p>
					)}
				</div>
			</div>

			{/* Viento */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label htmlFor="viento_nudos" className={labelClass}>
						Viento (Nudos)
					</label>
					<input
						id="viento_nudos"
						type="number"
						step="0.1"
						{...register("viento_nudos", { valueAsNumber: true })}
						className={inputClass}
					/>
				</div>
				<div>
					<label htmlFor="viento_direccion" className={labelClass}>
						Dirección Viento
					</label>
					<select
						id="viento_direccion"
						{...register("viento_direccion")}
						className={inputClass}
					>
						<option value="">Seleccionar...</option>
						<option value="N">Norte (N)</option>
						<option value="NE">Noreste (NE)</option>
						<option value="E">Este (E)</option>
						<option value="SE">Sureste (SE)</option>
						<option value="S">Sur (S)</option>
						<option value="SW">Suroeste (SW)</option>
						<option value="W">Oeste (W)</option>
						<option value="NW">Noroeste (NW)</option>
					</select>
				</div>
			</div>

			{/* Tripulación */}
			<div>
				<label htmlFor="tripulacion" className={labelClass}>
					Tripulación
				</label>
				<input
					id="tripulacion"
					type="text"
					placeholder="Nombres separados por comas..."
					{...register("tripulacion")}
					className={inputClass}
				/>
			</div>

			{/* Maniobras */}
			<div>
				<label htmlFor="maniobras" className={labelClass}>
					Maniobras Practicadas
				</label>
				<textarea
					id="maniobras"
					rows={2}
					placeholder="Ej: Viradas, trasluchadas, rizos..."
					{...register("maniobras")}
					className={`${inputClass} resize-none`}
				/>
			</div>

			{/* Observaciones */}
			<div>
				<label htmlFor="observaciones" className={labelClass}>
					Observaciones / Notas
				</label>
				<textarea
					id="observaciones"
					rows={3}
					placeholder="Incidencias, estado del mar, etc."
					{...register("observaciones")}
					className={`${inputClass} resize-none`}
				/>
			</div>

			{error && (
				<div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
					{error}
				</div>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 uppercase tracking-wider text-sm"
			>
				{isSubmitting ? "Guardando..." : "Registrar Salida"}
			</button>
		</form>
	);
}
