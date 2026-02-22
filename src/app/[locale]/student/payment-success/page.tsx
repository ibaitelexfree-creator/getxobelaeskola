"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { Suspense, useEffect, useState } from "react";

function SuccessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const sessionId = searchParams.get("session_id");
	const type = searchParams.get("type"); // course, rental, membership
	const [mounted, setMounted] = useState(false);
	const [details, setDetails] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setMounted(true);
		const fetchDetails = async () => {
			if (!sessionId) {
				setLoading(false);
				return;
			}

			try {
				// We'll use a public API route or direct supabase if we have it
				// For now, let's try to find the reservation/subscription
				const { createClient } = await import("@/lib/supabase/client");
				const supabase = createClient();

				if (type === "rental") {
					const { data } = await supabase
						.from("reservas_alquiler")
						.select("*, servicios_alquiler(*)")
						.eq("stripe_session_id", sessionId)
						.maybeSingle();
					if (data) setDetails(data);
				} else if (type === "course") {
					const { data } = await supabase
						.from("inscripciones")
						.select("*, cursos(*)")
						.eq("stripe_session_id", sessionId)
						.maybeSingle();
					if (data) setDetails(data);
				} else if (type === "membership") {
					const { data } = await supabase
						.from("subscriptions")
						.select("*")
						.eq("stripe_session_id", sessionId)
						.maybeSingle();
					if (data) setDetails(data);
				}
			} catch (err) {
				console.error("Error fetching success details:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchDetails();
	}, [sessionId, type]);

	if (!mounted) return null;

	const isMembership = type === "membership";
	const isRental = type === "rental";
	const isCourse = type === "course";

	return (
		<main className="min-h-screen bg-nautical-black flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
			{/* Background Decorative Elements */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brass-gold/5 blur-[120px] rounded-full" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sea-foam/5 blur-[120px] rounded-full" />
			</div>

			<div className="max-w-2xl w-full relative z-10">
				{/* Main Card */}
				<div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-700">
					{/* Top Accent Bar */}
					<div className="h-1.5 w-full bg-gradient-to-r from-brass-gold via-white/20 to-sea-foam" />

					<div className="p-8 md:p-12 text-center">
						{/* Status Icon */}
						<div className="mb-8 relative inline-block">
							<div className="w-24 h-24 rounded-full bg-brass-gold/10 flex items-center justify-center text-5xl border border-brass-gold/20 shadow-[0_0_50px_rgba(184,134,11,0.2)] animate-pulse">
								⚓
							</div>
							<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-sea-foam rounded-full flex items-center justify-center text-nautical-black text-xl border-4 border-nautical-black">
								✓
							</div>
						</div>

						<h1 className="text-4xl md:text-6xl font-display italic text-white mb-6 tracking-tight">
							{isMembership
								? "Bienvenido a Bordo"
								: isRental
									? "Reserva Confirmada"
									: "Inscripción Listos"}
						</h1>

						<p className="text-lg text-white/60 font-light max-w-md mx-auto mb-12 leading-relaxed">
							{isMembership
								? "Tu suscripción de socio ha sido activada correctamente. Ahora tienes acceso a tarifas exclusivas y ventajas en toda nuestra flota."
								: isRental
									? "Hemos registrado tu reserva de material. Recibirás un correo con los detalles y el código de acceso si es necesario."
									: "Tu plaza en el curso ha sido reservada con éxito. Ya puedes acceder al material teórico desde tu panel de alumno."}
						</p>

						{/* Order Confirmation Mockup */}
						<div className="bg-white/5 border border-white/5 rounded-xl p-6 mb-12 text-left space-y-4 max-w-sm mx-auto relative overflow-hidden group transition-all hover:border-brass-gold/20">
							<div className="absolute top-0 left-0 w-1 h-full bg-brass-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

							<div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
								<span>{loading ? "Verificando..." : "Transacción"}</span>
								<span>#{sessionId?.slice(-8).toUpperCase() || "PAGO-OK"}</span>
							</div>

							<div className="h-px bg-white/10 w-full" />

							<div className="space-y-1">
								<p className="text-2xs uppercase tracking-tighter text-brass-gold font-black">
									Estado
								</p>
								<p className="text-white text-sm font-medium flex items-center gap-2">
									<span
										className={`w-2 h-2 rounded-full shadow-[0_0_8px_#4fd1c5] ${loading ? "bg-yellow-400 animate-pulse" : "bg-sea-foam"}`}
									/>
									{loading
										? "Verificando con el banco..."
										: details
											? "Completado y Verificado"
											: "Procesando..."}
								</p>
							</div>

							{details?.servicios_alquiler && (
								<div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500">
									<p className="text-2xs uppercase tracking-tighter text-brass-gold font-black">
										Servicio
									</p>
									<p className="text-white text-sm font-medium">
										{details.servicios_alquiler.nombre_es}
									</p>
									<p className="text-white/40 text-[10px] italic">
										{details.fecha_reserva} - {details.hora_inicio.slice(0, 5)}
									</p>
								</div>
							)}

							{details?.cursos && (
								<div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500">
									<p className="text-2xs uppercase tracking-tighter text-brass-gold font-black">
										Curso
									</p>
									<p className="text-white text-sm font-medium">
										{details.cursos.nombre_es}
									</p>
									{details.metadata?.start_date && (
										<p className="text-white/40 text-[10px] italic">
											Empieza:{" "}
											{new Date(
												details.metadata.start_date,
											).toLocaleDateString()}
										</p>
									)}
								</div>
							)}

							<div className="space-y-1">
								<p className="text-2xs uppercase tracking-tighter text-brass-gold font-black">
									Referencia
								</p>
								<p className="text-white text-sm font-medium">
									Getxo Bela Eskola
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Link
								href="/"
								className="w-full py-5 bg-brass-gold text-nautical-black font-black uppercase tracking-[0.2em] text-[11px] rounded-sm hover:bg-white transition-all shadow-[0_10px_30px_rgba(184,134,11,0.2)] hover:-translate-y-1 active:scale-95 duration-300"
							>
								Ir al Inicio
							</Link>
							<Link
								href="/student/dashboard"
								className="w-full py-5 border border-white/10 text-white font-bold uppercase tracking-[0.2em] text-[11px] rounded-sm hover:bg-white/5 transition-all hover:border-white/30 hover:-translate-y-1 active:scale-95 duration-300"
							>
								Mi Panel Personal →
							</Link>

							{/* Hidden Dev link to Supabase */}
							{details && (
								<a
									href={`https://supabase.com/dashboard/project/ibaitelexfree-creator/editor/default/${isRental ? "reservas_alquiler" : isCourse ? "inscripciones" : "subscriptions"}?filter=id%3Deq%3D${details.id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="col-span-1 sm:col-span-2 text-[9px] uppercase tracking-widest text-white/10 hover:text-white/40 transition-colors mt-4 text-center block"
								>
									Ver en Supabase (Admin)
								</a>
							)}
						</div>
					</div>
				</div>

				{/* Footer Quote */}
				<p className="text-center mt-12 text-white/20 text-xs italic font-serif">
					"No hay viento favorable para quien no sabe a qué puerto se dirige." —
					Séneca
				</p>
			</div>
		</main>
	);
}

export default function PaymentSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-nautical-black flex items-center justify-center text-white">
					Cargando confirmación...
				</div>
			}
		>
			<SuccessContent />
		</Suspense>
	);
}
