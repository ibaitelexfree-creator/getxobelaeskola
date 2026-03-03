export type GlossaryCategory =
	| "Maniobras"
	| "Partes del barco"
	| "Meteorología"
	| "Reglamento";

export interface GlossaryTerm {
	id: string;
	term: string;
	definition: string;
	category: GlossaryCategory;
	moduleId?: string; // Optional: Link to a specific course module
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
	// Maniobras
	{
		id: "virada-por-avante",
		term: "Virada por avante",
		definition:
			"Maniobra que consiste en cambiar de amura pasando la proa por la línea del viento.",
		category: "Maniobras",
		moduleId: "maniobras-basicas",
	},
	{
		id: "trasluchada",
		term: "Trasluchada",
		definition:
			"Maniobra que consiste en cambiar de amura pasando la popa por la línea del viento. También llamada virada por redondo.",
		category: "Maniobras",
		moduleId: "maniobras-basicas",
	},
	{
		id: "ciar",
		term: "Ciar",
		definition:
			"Dar marcha atrás con la embarcación, ya sea a motor o remando.",
		category: "Maniobras",
		moduleId: "maniobras-puerto",
	},
	{
		id: "atraque",
		term: "Atraque",
		definition:
			"Acción de amarrar la embarcación a un muelle, pantalán o boya.",
		category: "Maniobras",
		moduleId: "maniobras-puerto",
	},
	{
		id: "fondear",
		term: "Fondear",
		definition: "Inmovilizar la embarcación mediante el uso del ancla.",
		category: "Maniobras",
		moduleId: "fondeo",
	},
	{
		id: "rizo",
		term: "Rizo",
		definition:
			"Disminución de la superficie vélica para adaptarla a la fuerza del viento.",
		category: "Maniobras",
		moduleId: "ajuste-velas",
	},
	{
		id: "cazar",
		term: "Cazar",
		definition: "Cobrar o tensar un cabo, escota o driza.",
		category: "Maniobras",
		moduleId: "ajuste-velas",
	},
	{
		id: "amollar",
		term: "Amollar",
		definition: "Soltar o dejar ir poco a poco un cabo, escota o driza.",
		category: "Maniobras",
		moduleId: "ajuste-velas",
	},

	// Partes del barco
	{
		id: "proa",
		term: "Proa",
		definition: "Parte delantera de la embarcación.",
		category: "Partes del barco",
		moduleId: "nomenclatura-basica",
	},
	{
		id: "popa",
		term: "Popa",
		definition: "Parte trasera de la embarcación.",
		category: "Partes del barco",
		moduleId: "nomenclatura-basica",
	},
	{
		id: "babor",
		term: "Babor",
		definition: "Costado izquierdo de la embarcación mirando de popa a proa.",
		category: "Partes del barco",
		moduleId: "nomenclatura-basica",
	},
	{
		id: "estribor",
		term: "Estribor",
		definition: "Costado derecho de la embarcación mirando de popa a proa.",
		category: "Partes del barco",
		moduleId: "nomenclatura-basica",
	},
	{
		id: "botavara",
		term: "Botavara",
		definition:
			"Palo horizontal articulado al mástil que sirve para cazar la vela mayor.",
		category: "Partes del barco",
		moduleId: "aparejo",
	},
	{
		id: "mastil",
		term: "Mástil",
		definition: "Palo vertical que sostiene las velas.",
		category: "Partes del barco",
		moduleId: "aparejo",
	},
	{
		id: "orza",
		term: "Orza",
		definition: "Pieza plana situada bajo el casco que evita el abatimiento.",
		category: "Partes del barco",
		moduleId: "casco-apendices",
	},
	{
		id: "timon",
		term: "Timón",
		definition: "Mecanismo utilizado para gobernar la embarcación.",
		category: "Partes del barco",
		moduleId: "casco-apendices",
	},
	{
		id: "escota",
		term: "Escota",
		definition: "Cabo que sirve para orientar y cazar las velas.",
		category: "Partes del barco",
		moduleId: "jarcia-labor",
	},
	{
		id: "driza",
		term: "Driza",
		definition: "Cabo utilizado para izar las velas.",
		category: "Partes del barco",
		moduleId: "jarcia-labor",
	},

	// Meteorología
	{
		id: "barometro",
		term: "Barómetro",
		definition: "Instrumento para medir la presión atmosférica.",
		category: "Meteorología",
		moduleId: "instrumentos-meteo",
	},
	{
		id: "borrasca",
		term: "Borrasca",
		definition: "Zona de baja presión atmosférica que suele traer mal tiempo.",
		category: "Meteorología",
		moduleId: "sistemas-presion",
	},
	{
		id: "anticiclon",
		term: "Anticiclón",
		definition:
			"Zona de alta presión atmosférica asociada generalmente a tiempo estable.",
		category: "Meteorología",
		moduleId: "sistemas-presion",
	},
	{
		id: "racha",
		term: "Racha",
		definition: "Aumento repentino y breve de la velocidad del viento.",
		category: "Meteorología",
		moduleId: "viento",
	},
	{
		id: "rolar",
		term: "Rolar",
		definition: "Cambio de dirección del viento.",
		category: "Meteorología",
		moduleId: "viento",
	},
	{
		id: "isobara",
		term: "Isobara",
		definition:
			"Línea que une puntos de igual presión atmosférica en un mapa meteorológico.",
		category: "Meteorología",
		moduleId: "mapas-tiempo",
	},

	// Reglamento (RIPA)
	{
		id: "babor-amuras",
		term: "Babor amuras",
		definition:
			"Situación en la que una embarcación recibe el viento por la banda de babor.",
		category: "Reglamento",
		moduleId: "ripa-preferencias",
	},
	{
		id: "estribor-amuras",
		term: "Estribor amuras",
		definition:
			"Situación en la que una embarcación recibe el viento por la banda de estribor. Tiene preferencia sobre la que va a babor amuras.",
		category: "Reglamento",
		moduleId: "ripa-preferencias",
	},
	{
		id: "alcance",
		term: "Alcance",
		definition:
			"Situación en la que una embarcación se aproxima a otra por su sector de popa (más de 22,5 grados a popa del través).",
		category: "Reglamento",
		moduleId: "ripa-maniobras",
	},
	{
		id: "demora",
		term: "Demora",
		definition:
			"Ángulo que forma la línea visual a un objeto con el norte (demora verdadera) o con la línea de crujía (demora relativa). Si la demora de un barco que se aproxima no varía, existe riesgo de abordaje.",
		category: "Reglamento",
		moduleId: "ripa-riesgo",
	},
	{
		id: "canal-angosto",
		term: "Canal angosto",
		definition:
			"Vía de navegación estrecha donde las embarcaciones deben mantenerse lo más cerca posible del límite exterior por su estribor.",
		category: "Reglamento",
		moduleId: "ripa-canales",
	},
	{
		id: "luz-tope",
		term: "Luz de tope",
		definition:
			"Luz blanca colocada sobre el eje longitudinal de la embarcación, visible en un arco de 225 grados hacia proa.",
		category: "Reglamento",
		moduleId: "ripa-luces",
	},
];
