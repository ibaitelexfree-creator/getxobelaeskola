"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import CertificateCard from "@/components/academy/CertificateCard";
import { apiUrl } from "@/lib/api";

interface Certificado {
	id: string;
	tipo: "curso" | "nivel";
	entidad_id: string;
	numero_certificado: string;
	verificacion_hash: string;
	nota_final: number;
	nivel_distincion: "estandar" | "merito" | "excelencia";
	distincion: boolean;
	fecha_emision: string;
	curso?: { nombre_es: string; nombre_eu: string };
	nivel?: { nombre_es: string; nombre_eu: string };
	perfil?: { full_name: string };
}

export default function CertificatesPage({
	params,
}: {
	params: { locale: string };
}) {
	const t = useTranslations("academy");
	const [certificados, setCertificados] = useState<Certificado[]>([]);
	const [loading, setLoading] = useState(true);
	const [studentName, setStudentName] = useState<string>("Navegante");

	useEffect(() => {
		async function fetchCerts() {
			try {
				const res = await fetch(apiUrl("/api/academy/certificates"));
				const data = await res.json();
				if (data.certificados) {
					setCertificados(data.certificados);
					// Extract name from the first certificate profile if available
					if (
						data.certificados.length > 0 &&
						data.certificados[0].perfil?.full_name
					) {
						setStudentName(data.certificados[0].perfil.full_name);
					}
				}
			} catch (error) {
				console.error("Error cargando certificados:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchCerts();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-nautical-black flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-nautical-black via-nautical-black to-[#0a1628] text-white pb-20">
			{/* Header */}
			<div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
				<div className="container mx-auto px-6 py-12">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
						<div>
							<Link
								href={`/${params.locale}/academy/dashboard`}
								className="text-accent text-sm hover:underline mb-2 inline-block"
							>
								← Volver al Panel
							</Link>
							<h1 className="text-4xl font-display italic text-white">
								Tus Certificaciones
							</h1>
							<p className="text-white/60">
								Acreditaciones oficiales obtenidas en Getxo Bela Eskola.
							</p>
						</div>
						<div className="flex items-center gap-4">
							<div className="text-right">
								<div className="text-xs uppercase tracking-widest text-white/40 mb-1">
									Total Obtenidos
								</div>
								<div className="text-3xl font-display text-accent">
									{certificados.length}
								</div>
							</div>
							<div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-3xl">
								🎓
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-6 py-16">
				{certificados.length === 0 ? (
					<div className="max-w-xl mx-auto text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
						<div className="text-6xl mb-6 opacity-30">⚓</div>
						<h2 className="text-2xl font-display italic mb-4">
							Todavía no has obtenido certificados
						</h2>
						<p className="text-white/40 mb-8">
							Para obtener tu primera certificación, completa un curso con una
							nota mínima del 75%.
						</p>
						<Link
							href={`/${params.locale}/academy`}
							className="inline-block px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest text-sm rounded hover:bg-white transition-all shadow-xl shadow-accent/20"
						>
							Ver Cursos Disponibles
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{certificados.map((cert) => (
							<CertificateCard
								key={cert.id}
								certificate={cert}
								studentName={studentName}
								locale={params.locale}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
