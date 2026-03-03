"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React from "react";

export default function MembershipConfirmationPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	// Nota: Usamos textos directos para asegurar que la página se vea genial de inmediato
	return (
		<main className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 relative overflow-hidden">
			<div className="bg-mesh" />

			<div className="max-w-xl w-full bg-card p-12 border border-brass-gold/30 rounded-sm backdrop-blur-md relative z-10 text-center">
				<div className="w-20 h-20 bg-brass-gold/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 border border-brass-gold/20 shadow-[0_0_30px_rgba(184,134,11,0.1)]">
					⚓
				</div>

				<h1 className="text-3xl md:text-5xl font-display italic text-white mb-6">
					Suscripción Actualizada
				</h1>

				<div className="space-y-4 mb-10">
					<p className="text-white/60 font-light leading-relaxed">
						Tus cambios se han procesado correctamente en el sistema de pagos.
						Ya puedes seguir gestionando tus reservas y disfrutando de tus
						ventajas de socio.
					</p>
					<div className="py-3 px-4 bg-white/5 border-y border-white/5 text-[10px] uppercase tracking-[0.2em] text-brass-gold font-black">
						Club de Navegación Getxo Bela
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<Link
						href={`/${locale}/student/dashboard`}
						className="w-full py-4 bg-brass-gold text-nautical-black font-black uppercase tracking-widest text-xs rounded hover:bg-white transition-all shadow-[0_0_40px_rgba(184,134,11,0.15)]"
					>
						Volver a mi Panel →
					</Link>

					<Link
						href={`/${locale}/rental`}
						className="w-full py-4 border border-white/10 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
					>
						Reservar Material con Descuento
					</Link>
				</div>
			</div>
		</main>
	);
}
