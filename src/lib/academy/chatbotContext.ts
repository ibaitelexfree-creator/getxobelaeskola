import {
	NAUTICAL_TERMS,
	type NomenclatureCard,
} from "@/data/academy/nautical-nomenclature";

// Define the available modules in the academy for the chatbot to recommend
export const ACADEMY_MODULES = [
	{
		id: "nomenclature",
		title: "Nomenclatura Náutica",
		path: "/academy/nomenclature",
		description:
			"Aprende las partes del barco (proa, popa, babor, estribor), dimensiones y elementos estructurales.",
		keywords: [
			"partes",
			"barco",
			"proa",
			"popa",
			"babor",
			"estribor",
			"casco",
			"estructura",
		],
	},
	{
		id: "wind-lab",
		title: "Laboratorio de Viento",
		path: "/academy/wind-lab",
		description:
			"Visualiza y entiende el viento real y el viento aparente. Aprende cómo afecta a la navegación.",
		keywords: [
			"viento",
			"real",
			"aparente",
			"rachas",
			"dirección",
			"intensidad",
		],
	},
	{
		id: "simulador",
		title: "Simulador de Vela",
		path: "/academy/simulador",
		description:
			"Practica las maniobras de vela en un entorno seguro y controlado.",
		keywords: [
			"simulador",
			"práctica",
			"maniobra",
			"timón",
			"virar",
			"trasluchar",
		],
	},
	{
		id: "exploration",
		title: "Exploración y Constelaciones",
		path: "/academy/exploration",
		description:
			"Descubre la historia de las regatas y aprende a navegar por las estrellas (constelaciones).",
		keywords: [
			"historia",
			"estrellas",
			"constelaciones",
			"navegación astronómica",
			"regatas",
		],
	},
	{
		id: "logbook",
		title: "Cuaderno de Bitácora (Logbook)",
		path: "/academy/logbook",
		description:
			"Registra tus horas de navegación, sube tus tracks GPX y analiza tu progreso.",
		keywords: ["bitácora", "logbook", "registro", "horas", "gpx", "tracks"],
	},
	{
		id: "maniobras",
		title: "Maniobras Básicas",
		path: "/academy/unit/maniobras", // Assuming a unit path based on structure
		description:
			"Aprende las maniobras fundamentales: virada, trasluchada, atraque y desatraque.",
		keywords: ["virada", "trasluchada", "atraque", "fondeo"],
	},
	{
		id: "seguridad",
		title: "Seguridad a Bordo",
		path: "/academy/unit/seguridad",
		description:
			"Normas de seguridad, equipo obligatorio y procedimientos de emergencia.",
		keywords: [
			"seguridad",
			"chaleco",
			"bengalas",
			"emergencia",
			"hombre al agua",
		],
	},
];

export function getSystemPrompt(): string {
	// 1. Construct Nomenclature Context
	const nomenclatureContext = NAUTICAL_TERMS.map(
		(term: NomenclatureCard) =>
			`- ${term.term_es} (${term.term_eu}): ${term.definition_es}. Dificultad: ${term.difficulty}. Categoría: ${term.category}.`,
	).join("\n");

	// 2. Construct Modules Context
	const modulesContext = ACADEMY_MODULES.map(
		(mod) =>
			`- Módulo: "${mod.title}" (${mod.path}). ${mod.description} Palabras clave: ${mod.keywords.join(", ")}.`,
	).join("\n");

	// 3. Assemble the full prompt
	return `
Eres "El Piloto", un instructor de vela experto, paciente y apasionado de la academia náutica.
Tu misión es ayudar a los alumnos a entender conceptos de navegación, resolver dudas sobre el curso y guiarles hacia los módulos de aprendizaje adecuados.

**Tono y Personalidad:**
- Eres profesional pero cercano, usas un lenguaje náutico preciso pero explicas los términos técnicos si el alumno es principiante.
- Te gusta usar metáforas marineras sutiles ("mantengamos el rumbo", "buen viento").
- Eres motivador y fomentas la seguridad ante todo.

**Tu Base de Conocimiento (Nomenclatura):**
Aquí tienes una lista de términos que debes conocer y explicar con precisión si te preguntan:
${nomenclatureContext}

**Estructura del Curso (Módulos):**
Si detectas que el alumno tiene dudas sobre un tema específico, recomiéndale visitar el módulo correspondiente usando el formato de enlace Markdown [Nombre del Módulo](URL).
${modulesContext}

**Instrucciones de Respuesta:**
1. Responde de forma concisa pero completa.
2. Si la respuesta requiere una explicación larga, usa listas o puntos clave.
3. SIEMPRE que sea pertinente, enlaza al módulo del curso relacionado. Por ejemplo: "Para practicar esto, te recomiendo ir al [Simulador de Vela](/academy/simulador)".
4. Si te preguntan algo fuera del contexto náutico, responde amablemente que tu especialidad es la navegación y vuelve al tema.
5. Puedes hablar en Español (principal) o Euskera si el usuario te habla en ese idioma (tienes los términos en Euskera en tu base de datos).

¡Buena proa!
`.trim();
}
