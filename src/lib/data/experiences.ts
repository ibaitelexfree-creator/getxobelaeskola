import { createClient } from "@/lib/supabase/server";

export interface Experiencia {
	id: string;
	slug: string;
	nombre_es: string;
	nombre_eu?: string;
	nombre_en?: string;
	descripcion_es?: string;
	descripcion_eu?: string;
	descripcion_en?: string;
	tipo:
		| "cumpleanos"
		| "taller"
		| "evento"
		| "visita"
		| "consultoria"
		| "bono"
		| "atraque";
	precio?: number;
	precio_tipo: "por_persona" | "plana" | "por_grupo" | "por_mes";
	precio_anual?: number;
	precio_mensual?: number;
	duracion_h?: number;
	min_participantes?: number;
	max_participantes?: number;
	requisitos_es?: string;
	requisitos_eu?: string;
	requisitos_en?: string;
	edad_minima?: number;
	fianza?: number;
	imagen_url?: string;
	ubicacion_lat?: number;
	ubicacion_lng?: number;
	ubicacion_texto?: string;
	fecha_evento?: string;
	recurrente: boolean;
	horario_texto?: string;
	activo: boolean;
	visible: boolean;
	orden: number;
}

export type ExperienciaTipo = Experiencia["tipo"];

const TIPO_LABELS: Record<
	ExperienciaTipo,
	{ es: string; eu: string; en: string }
> = {
	cumpleanos: { es: "Cumpleaños", eu: "Urtebetetzeak", en: "Birthdays" },
	taller: { es: "Talleres", eu: "Tailerrak", en: "Workshops" },
	evento: { es: "Eventos", eu: "Ekitaldiak", en: "Events" },
	visita: { es: "Visitas", eu: "Bisitak", en: "Tours" },
	consultoria: { es: "Consultoría", eu: "Aholkularitza", en: "Consulting" },
	bono: { es: "Bonos", eu: "Bonoak", en: "Vouchers" },
	atraque: { es: "Atraques", eu: "Atrakak", en: "Moorings" },
};

export function getTipoLabel(tipo: ExperienciaTipo, locale: string): string {
	const labels = TIPO_LABELS[tipo];
	if (locale === "eu") return labels.eu;
	if (locale === "en") return labels.en;
	return labels.es;
}

export function getExperienciaName(exp: Experiencia, locale: string): string {
	if (locale === "eu" && exp.nombre_eu) return exp.nombre_eu;
	if (locale === "en" && exp.nombre_en) return exp.nombre_en;
	return exp.nombre_es;
}

export function getExperienciaDescription(
	exp: Experiencia,
	locale: string,
): string {
	if (locale === "eu" && exp.descripcion_eu) return exp.descripcion_eu;
	if (locale === "en" && exp.descripcion_en) return exp.descripcion_en;
	return exp.descripcion_es || "";
}

export function formatExperienciaPrice(
	exp: Experiencia,
	locale: string,
): string {
	if (exp.precio_tipo === "por_mes" && exp.precio_mensual) {
		return `${exp.precio_mensual}€/${locale === "eu" ? "hileko" : locale === "en" ? "month" : "mes"}`;
	}
	if (!exp.precio) return "";

	const suffix: Record<string, Record<string, string>> = {
		por_persona: { es: "/persona", eu: "/pertsonako", en: "/person" },
		plana: { es: "", eu: "", en: "" },
		por_grupo: { es: "/grupo", eu: "/taldeko", en: "/group" },
		por_mes: { es: "/mes", eu: "/hileko", en: "/month" },
	};

	return `${exp.precio}€${suffix[exp.precio_tipo]?.[locale] || ""}`;
}

export async function fetchExperiencias(
	tipo?: ExperienciaTipo,
): Promise<Experiencia[]> {
	const supabase = createClient();

	let query = supabase
		.from("experiencias")
		.select("*")
		.eq("activo", true)
		.eq("visible", true)
		.order("orden", { ascending: true });

	if (tipo) {
		query = query.eq("tipo", tipo);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching experiencias:", error);
		return [];
	}

	return (data || []) as Experiencia[];
}

export async function fetchExperienciaBySlug(
	slug: string,
): Promise<Experiencia | null> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("experiencias")
		.select("*")
		.eq("slug", slug)
		.eq("activo", true)
		.single();

	if (error) {
		console.error("Error fetching experiencia:", error);
		return null;
	}

	return data as Experiencia;
}

export function groupExperienciasByTipo(
	experiencias: Experiencia[],
): Record<ExperienciaTipo, Experiencia[]> {
	return experiencias.reduce(
		(acc, exp) => {
			if (!acc[exp.tipo]) acc[exp.tipo] = [];
			acc[exp.tipo].push(exp);
			return acc;
		},
		{} as Record<ExperienciaTipo, Experiencia[]>,
	);
}
