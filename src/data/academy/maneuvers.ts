export interface ManeuverStep {
	title: string;
	description: string;
	boat: {
		x: number; // 0-100% of viewbox width
		y: number; // 0-100% of viewbox height
		rotation: number; // degrees (0 is up/North)
		mainSail: number; // degrees relative to boat centerline (-90 to 90)
		jib: number; // degrees relative to boat centerline (-90 to 90)
		opacity?: number;
	};
	wind?: {
		angle: number; // degrees
	};
	extraElements?: {
		id: string;
		type: "buoy" | "dock" | "person" | "arrow";
		x: number;
		y: number;
		rotation?: number;
		scale?: number;
		opacity?: number;
		color?: string;
		width?: number;
		height?: number;
	}[];
}

export interface Maneuver {
	id: string;
	name: string;
	description: string;
	steps: ManeuverStep[];
}

export const MANEUVERS: Maneuver[] = [
	{
		id: "virada-por-avante",
		name: "Virada por Avante (Tacking)",
		description:
			"Maniobra para cambiar de amura pasando la proa por el viento.",
		steps: [
			{
				title: "Ceñida (Close Hauled)",
				description:
					"Navegamos en ceñida amurados a estribor. Las velas están cazadas al máximo.",
				boat: { x: 80, y: 80, rotation: -45, mainSail: 15, jib: 15 },
				wind: { angle: 0 },
			},
			{
				title: "Meter el Timón",
				description:
					"Orzamos suavemente metiendo el timón a la banda de barlovento. La proa busca el viento.",
				boat: { x: 65, y: 65, rotation: -20, mainSail: 5, jib: 5 },
				wind: { angle: 0 },
			},
			{
				title: "Proa al Viento",
				description:
					"El barco se encuentra proa al viento. Las velas flamean. Es el momento crítico donde se pierde velocidad.",
				boat: { x: 50, y: 50, rotation: 0, mainSail: 0, jib: 0 },
				wind: { angle: 0 },
			},
			{
				title: "Cambio de Amura",
				description:
					"El barco cruza la línea del viento. Las velas cambian de lado. El foque se pasa a la nueva banda.",
				boat: { x: 35, y: 35, rotation: 20, mainSail: -5, jib: -5 },
				wind: { angle: 0 },
			},
			{
				title: "Nuevo Rumbo",
				description:
					"Estabilizamos el rumbo en la nueva amura (babor). Ajustamos las velas para ceñida.",
				boat: { x: 20, y: 20, rotation: 45, mainSail: -15, jib: -15 },
				wind: { angle: 0 },
			},
		],
	},
	{
		id: "empopada",
		name: "Trasluchada / Empopada (Gybing)",
		description:
			"Maniobra para cambiar de amura pasando la popa por el viento.",
		steps: [
			{
				title: "Largo / Empopada",
				description:
					"Navegamos a un largo o empopada. El viento entra por la aleta o popa.",
				boat: { x: 20, y: 20, rotation: 150, mainSail: -60, jib: -70 },
				wind: { angle: 0 },
			},
			{
				title: "Arribar",
				description:
					"Arribamos hasta ponernos con el viento justo por la popa (viento en popa cerrada).",
				boat: { x: 40, y: 40, rotation: 170, mainSail: -80, jib: -80 },
				wind: { angle: 0 },
			},
			{
				title: "Cazar Mayor",
				description:
					"Cazamos la mayor al centro para evitar un golpe violento al cambiar de lado.",
				boat: { x: 50, y: 50, rotation: 180, mainSail: 0, jib: 0 }, // Boom centered
				wind: { angle: 0 },
			},
			{
				title: "Cambio de Banda",
				description:
					"La botavara pasa al otro lado. Soltamos escota rápidamente para que la vela se abra.",
				boat: { x: 60, y: 60, rotation: 190, mainSail: 80, jib: 80 },
				wind: { angle: 0 },
			},
			{
				title: "Nuevo Rumbo",
				description: "Ajustamos el rumbo y las velas en la nueva amura.",
				boat: { x: 80, y: 80, rotation: 210, mainSail: 60, jib: 70 },
				wind: { angle: 0 },
			},
		],
	},
	{
		id: "hombre-al-agua",
		name: "Hombre al Agua (Man Overboard)",
		description:
			"Maniobra de recuperación de una persona caída al mar (Método Anderson / Curva de evolución).",
		steps: [
			{
				title: "¡Hombre al Agua!",
				description:
					"Se da la voz de alarma. Lanzamos el aro salvavidas. El barco sigue su rumbo inicial.",
				boat: { x: 50, y: 80, rotation: -45, mainSail: 15, jib: 15 },
				wind: { angle: 0 },
				extraElements: [
					{ id: "mob", type: "person", x: 50, y: 85, opacity: 0 },
				],
			},
			{
				title: "Apertura",
				description:
					"Abrimos el rumbo (aleta) para alejarnos y ganar espacio de maniobra, manteniendo contacto visual.",
				boat: { x: 60, y: 60, rotation: -90, mainSail: 45, jib: 45 },
				wind: { angle: 0 },
				extraElements: [
					{ id: "mob", type: "person", x: 50, y: 85, opacity: 1, color: "red" },
				],
			},
			{
				title: "Virada / Retorno",
				description:
					"Realizamos una virada o trasluchada (según el método) para volver hacia la víctima a un rumbo de ceñida/descuartelar.",
				boat: { x: 40, y: 40, rotation: 135, mainSail: -30, jib: -30 }, // Returning
				wind: { angle: 0 },
				extraElements: [{ id: "mob", type: "person", x: 50, y: 85 }],
			},
			{
				title: "Aproximación",
				description:
					"Nos aproximamos a la víctima por sotavento, controlando la velocidad con las velas.",
				boat: { x: 45, y: 70, rotation: 45, mainSail: -10, jib: -10 }, // Close hauled approach
				wind: { angle: 0 },
				extraElements: [{ id: "mob", type: "person", x: 50, y: 85 }],
			},
			{
				title: "Recogida",
				description:
					"Detenemos el barco junto a la víctima (proa al viento o fachear) para subirla a bordo.",
				boat: { x: 49, y: 84, rotation: 10, mainSail: 0, jib: 0 },
				wind: { angle: 0 },
				extraElements: [{ id: "mob", type: "person", x: 50, y: 85 }],
			},
		],
	},
	{
		id: "atraque",
		name: "Atraque en Muelle (Docking)",
		description: "Aproximación y atraque de costado al muelle.",
		steps: [
			{
				title: "Aproximación",
				description:
					"Nos acercamos al muelle con un ángulo de unos 30-45 grados y poca velocidad.",
				boat: { x: 20, y: 80, rotation: 60, mainSail: 0, jib: 0 }, // Sails loose or motring
				wind: { angle: 0 },
				extraElements: [
					{
						id: "dock",
						type: "dock",
						x: 50,
						y: 20,
						width: 80,
						height: 10,
						rotation: 0,
					},
				],
			},
			{
				title: "Reducir Velocidad",
				description:
					"Reducimos la velocidad al mínimo gobernable. Preparamos las defensas y amarras.",
				boat: { x: 40, y: 50, rotation: 60, mainSail: 0, jib: 0 },
				wind: { angle: 0 },
				extraElements: [
					{
						id: "dock",
						type: "dock",
						x: 50,
						y: 20,
						width: 80,
						height: 10,
						rotation: 0,
					},
				],
			},
			{
				title: "Virar Paralelo",
				description:
					"Cuando estamos cerca, metemos timón para poner el barco paralelo al muelle.",
				boat: { x: 50, y: 35, rotation: 10, mainSail: 0, jib: 0 },
				wind: { angle: 0 },
				extraElements: [
					{
						id: "dock",
						type: "dock",
						x: 50,
						y: 20,
						width: 80,
						height: 10,
						rotation: 0,
					},
				],
			},
			{
				title: "Atrás / Detención",
				description:
					"Damos una palada atrás (si vamos a motor) o orzamos para detener la arrancada justo en el sitio.",
				boat: { x: 50, y: 28, rotation: 0, mainSail: 0, jib: 0 },
				wind: { angle: 0 },
				extraElements: [
					{
						id: "dock",
						type: "dock",
						x: 50,
						y: 20,
						width: 80,
						height: 10,
						rotation: 0,
					},
				],
			},
		],
	},
];
