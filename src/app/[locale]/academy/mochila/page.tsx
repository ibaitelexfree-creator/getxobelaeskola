import { ArrowLeft, Backpack } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import MistakeReviewDeck from "@/components/academy/MistakeReviewDeck";
import { createClient } from "@/lib/supabase/server";

export default async function MochilaPage({
	params,
}: {
	params: { locale: string };
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`/${params.locale}/login`);
	}

	// Fetch mistakes with question details
	const { data: mistakes, error } = await supabase
		.from("errores_repaso")
		.select(`
            *,
            pregunta:pregunta_id (
                id,
                enunciado_es,
                enunciado_eu,
                opciones_json,
                respuesta_correcta,
                explicacion_es,
                explicacion_eu,
                imagen_url,
                tipo_pregunta
            )
        `)
		.eq("alumno_id", user.id)
		.eq("estado", "pendiente")
		.order("fecha_fallo", { ascending: false });

	if (error) {
		console.error("Error fetching mistakes:", error);
	}

	return (
		<div className="min-h-screen bg-nautical-black text-white p-6 pb-20 safe-area-top">
			<div className="max-w-2xl mx-auto pt-8">
				<header className="mb-12 flex items-center gap-6">
					<Link
						href={`/${params.locale}/academy/dashboard`}
						className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
					>
						<ArrowLeft size={20} />
					</Link>
					<div>
						<h1 className="text-3xl font-display italic flex items-center gap-3">
							<span className="text-accent">
								<Backpack size={32} />
							</span>
							<span>Mochila de Dudas</span>
						</h1>
						<p className="text-white/40 text-xs uppercase tracking-widest mt-1">
							Repasa tus errores y domina la materia
						</p>
					</div>
				</header>

				<main>
					<MistakeReviewDeck
						initialMistakes={mistakes || []}
						locale={params.locale}
					/>
				</main>
			</div>
		</div>
	);
}
