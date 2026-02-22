export interface KnotStep {
	description: string;
	image_url?: string; // Placeholder
}

export interface Knot {
	id: string;
	name: string;
	description: string;
	difficulty: "facil" | "medio" | "dificil";
	category: "basico" | "amarre" | "tope" | "union";
	steps: KnotStep[];
	video_url?: string;
}

export const KNOTS_DATA: Knot[] = [
	{
		id: "nudo-llano",
		name: "Nudo Llano",
		description:
			"Usado para unir dos cabos de la misma mena. No es seguro si hay mucha tensión o si los cabos son de diferente grosor.",
		difficulty: "facil",
		category: "union",
		steps: [
			{ description: "Cruza el cabo izquierdo sobre el derecho." },
			{
				description:
					"Pasa el cabo izquierdo por debajo del derecho (forma un medio nudo).",
			},
			{
				description:
					"Ahora cruza el cabo derecho (que viene de la izquierda) sobre el izquierdo.",
			},
			{ description: "Pasa el cabo derecho por debajo del izquierdo y azoca." },
			{ description: "El resultado debe ser simétrico y plano." },
		],
	},
	{
		id: "as-de-guia",
		name: "As de Guía",
		description:
			"El nudo más importante. Forma una gaza fija que no se corre ni se aprieta bajo carga. Fácil de deshacer.",
		difficulty: "facil",
		category: "basico",
		steps: [
			{
				description:
					'Haz un pequeño bucle (el "lago") con el chicote por encima del firme.',
			},
			{ description: 'El chicote (la "serpiente") sale del lago desde abajo.' },
			{ description: 'Rodea el firme (el "árbol") por detrás.' },
			{ description: "Vuelve a entrar en el lago." },
			{
				description:
					"Sujeta el chicote y el firme del bucle, y tira del firme principal para azocar.",
			},
		],
	},
	{
		id: "ballestrinque",
		name: "Ballestrinque",
		description:
			"Nudo rápido para sujetar un cabo a un poste o barra. Ideal para defensas.",
		difficulty: "medio",
		category: "amarre",
		steps: [
			{
				description:
					"Da una vuelta alrededor del poste con el chicote sobre el firme.",
			},
			{ description: "Da una segunda vuelta cruzando sobre la primera." },
			{ description: "Pasa el chicote por debajo de la segunda vuelta." },
			{ description: "Azoca tirando de ambos extremos." },
		],
	},
	{
		id: "ocho",
		name: "Nudo en Ocho",
		description:
			"Nudo de tope para evitar que un cabo se escape por una polea o roldana.",
		difficulty: "facil",
		category: "tope",
		steps: [
			{ description: "Haz un bucle pasando el chicote por debajo del firme." },
			{ description: "Pasa el chicote por encima del firme." },
			{
				description: "Introduce el chicote por el bucle inicial desde arriba.",
			},
			{ description: "Azoca para formar la figura de ocho." },
		],
	},
];
