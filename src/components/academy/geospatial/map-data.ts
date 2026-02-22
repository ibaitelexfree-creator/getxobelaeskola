export interface Location {
	lat: number;
	lng: number;
	name: string;
	description?: string;
	type?: "club" | "landmark" | "danger" | "start" | "end";
}

export const MAP_CENTER: [number, number] = [43.3425, -3.013]; // Abra de Bilbao

export const NAUTICAL_CLUB: Location = {
	lat: 43.3444,
	lng: -3.0125,
	name: "Real Club Marítimo del Abra",
	description:
		"Sede principal del club náutico. Punto de partida para regatas y entrenamientos.",
	type: "club",
};

export const WAYPOINTS: Location[] = [
	{
		lat: 43.3485,
		lng: -3.0185,
		name: "Puerto Deportivo de Getxo",
		description:
			"Marina principal con servicios completos para embarcaciones deportivas.",
		type: "landmark",
	},
	{
		lat: 43.3235,
		lng: -3.0165,
		name: "Puente Colgante (Bizkaia Zubia)",
		description:
			"Patrimonio de la Humanidad. Marca el límite de navegación para veleros de mástil alto sin apertura.",
		type: "landmark",
	},
	{
		lat: 43.355,
		lng: -3.03,
		name: "Boya de Recalada",
		description:
			"Punto de referencia clave para la entrada al canal de Bilbao.",
		type: "landmark",
	},
	{
		lat: 43.352,
		lng: -3.008,
		name: "Puerto Viejo de Algorta",
		description:
			"Antiguo puerto de pescadores, zona de fondeo tradicional con buen resguardo del NO.",
		type: "landmark",
	},
];

export const NAVIGATION_ROUTE: [number, number][] = [
	[43.3444, -3.0125], // Club
	[43.346, -3.015], // Salida bocana
	[43.348, -3.02], // Hacia el Abra exterior
	[43.352, -3.025], // Rumbo NO
	[43.355, -3.03], // Boya Recalada
	[43.36, -3.04], // Mar abierto
];

// Zona de bajos cerca de Punta Galea o el rompeolas
export const DANGER_ZONE: [number, number][] = [
	[43.36, -3.025],
	[43.362, -3.03],
	[43.365, -3.028],
	[43.363, -3.022],
];

export const MAP_CONFIG = {
	zoom: 13,
	scrollWheelZoom: false,
	tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
