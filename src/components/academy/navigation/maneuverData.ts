export interface ManeuverStep {
	id: number;
	boatPosition: { x: number; y: number }; // 0-100 percentage
	boatRotation: number; // degrees, 0 is North (Up)
	sailAngle: number; // degrees relative to boat centerline
	description: string;
	windDirection: number; // degrees, usually 0
	extraElement?: {
		type: "mob" | "dock";
		x: number;
		y: number;
		rotation?: number;
	};
}

export interface Maneuver {
	id: string;
	name: string;
	description: string;
	steps: ManeuverStep[];
}

export const MANEUVERS: Maneuver[] = [
	{
		id: "virada",
		name: "Virada por Avante (Tacking)",
		description:
			"Maniobra para cambiar de amura pasando la proa por la línea del viento.",
		steps: [
			{
				id: 1,
				boatPosition: { x: 80, y: 80 },
				boatRotation: -45,
				sailAngle: 15,
				description:
					"Navegando de ceñida (amura estribor). Preparados para virar.",
				windDirection: 0,
			},
			{
				id: 2,
				boatPosition: { x: 70, y: 70 },
				boatRotation: -30,
				sailAngle: 10,
				description: "Orzando. El timonel mete la caña a sotavento.",
				windDirection: 0,
			},
			{
				id: 3,
				boatPosition: { x: 60, y: 60 },
				boatRotation: -10,
				sailAngle: 0,
				description: "Proa al viento. Las velas flamean.",
				windDirection: 0,
			},
			{
				id: 4,
				boatPosition: { x: 50, y: 50 },
				boatRotation: 10,
				sailAngle: 0,
				description:
					"Pasando el viento. Foque acuartelado para ayudar al giro.",
				windDirection: 0,
			},
			{
				id: 5,
				boatPosition: { x: 40, y: 40 },
				boatRotation: 30,
				sailAngle: -10,
				description: "Cazando velas en la nueva amura (babor).",
				windDirection: 0,
			},
			{
				id: 6,
				boatPosition: { x: 30, y: 30 },
				boatRotation: 45,
				sailAngle: -15,
				description: "Rumbo de ceñida establecido. Virada completada.",
				windDirection: 0,
			},
		],
	},
	{
		id: "empopada",
		name: "Trasluchada (Gybing)",
		description:
			"Maniobra para cambiar de amura pasando la popa por la línea del viento.",
		steps: [
			{
				id: 1,
				boatPosition: { x: 20, y: 20 },
				boatRotation: 135,
				sailAngle: 60,
				description:
					"Navegando al largo (amura babor). Preparados para trasluchar.",
				windDirection: 0,
			},
			{
				id: 2,
				boatPosition: { x: 35, y: 35 },
				boatRotation: 160,
				sailAngle: 70,
				description: "Arribando hacia empopada. Cazando mayor al centro.",
				windDirection: 0,
			},
			{
				id: 3,
				boatPosition: { x: 50, y: 50 },
				boatRotation: 180,
				sailAngle: 0,
				description: "Viento en popa cerrada. La botavara pasa al otro lado.",
				windDirection: 0,
			},
			{
				id: 4,
				boatPosition: { x: 65, y: 65 },
				boatRotation: 200,
				sailAngle: -70,
				description: "Soltando escota rápidamente en la nueva amura.",
				windDirection: 0,
			},
			{
				id: 5,
				boatPosition: { x: 80, y: 80 },
				boatRotation: 225,
				sailAngle: -60,
				description: "Estabilizando el rumbo al largo (amura estribor).",
				windDirection: 0,
			},
		],
	},
	{
		id: "mob",
		name: "Hombre al Agua (Man Overboard)",
		description: "Maniobra de recuperación inmediata.",
		steps: [
			{
				id: 1,
				boatPosition: { x: 20, y: 80 },
				boatRotation: -90,
				sailAngle: 45,
				description: "Navegando al través. ¡Hombre al agua!",
				windDirection: 0,
				extraElement: { type: "mob", x: 40, y: 80 },
			},
			{
				id: 2,
				boatPosition: { x: 40, y: 70 },
				boatRotation: -120,
				sailAngle: 60,
				description:
					"Arribar inmediatamente a un largo para alejarse y ganar espacio.",
				windDirection: 0,
				extraElement: { type: "mob", x: 40, y: 80 },
			},
			{
				id: 3,
				boatPosition: { x: 60, y: 60 },
				boatRotation: -45,
				sailAngle: 15,
				description: "Virar por avante para volver a barlovento de la víctima.",
				windDirection: 0,
				extraElement: { type: "mob", x: 40, y: 80 },
			},
			{
				id: 4,
				boatPosition: { x: 50, y: 50 },
				boatRotation: 45,
				sailAngle: -15,
				description: "Aproximación en ceñida, controlando velocidad.",
				windDirection: 0,
				extraElement: { type: "mob", x: 40, y: 80 },
			},
			{
				id: 5,
				boatPosition: { x: 42, y: 75 },
				boatRotation: 10,
				sailAngle: 0,
				description: "Orzar para detener el barco a barlovento de la víctima.",
				windDirection: 0,
				extraElement: { type: "mob", x: 40, y: 80 },
			},
		],
	},
	{
		id: "atraque",
		name: "Atraque en Muelle",
		description: "Aproximación y atraque de costado.",
		steps: [
			{
				id: 1,
				boatPosition: { x: 20, y: 80 },
				boatRotation: -45,
				sailAngle: 0,
				description:
					"Aproximación al muelle con velocidad controlada (motor o inercia).",
				windDirection: 0,
				extraElement: { type: "dock", x: 50, y: 20, rotation: 0 },
			},
			{
				id: 2,
				boatPosition: { x: 40, y: 50 },
				boatRotation: -30,
				sailAngle: 0,
				description: "Ángulo de aproximación de unos 30-45 grados.",
				windDirection: 0,
				extraElement: { type: "dock", x: 50, y: 20, rotation: 0 },
			},
			{
				id: 3,
				boatPosition: { x: 48, y: 35 },
				boatRotation: -15,
				sailAngle: 0,
				description: "Punto muerto o marcha atrás breve para frenar.",
				windDirection: 0,
				extraElement: { type: "dock", x: 50, y: 20, rotation: 0 },
			},
			{
				id: 4,
				boatPosition: { x: 50, y: 25 },
				boatRotation: 0,
				sailAngle: 0,
				description:
					"Timón a la banda contraria para colocar el barco paralelo.",
				windDirection: 0,
				extraElement: { type: "dock", x: 50, y: 20, rotation: 0 },
			},
			{
				id: 5,
				boatPosition: { x: 50, y: 22 },
				boatRotation: 0,
				sailAngle: 0,
				description: "Barco detenido y paralelo. ¡Amarras!",
				windDirection: 0,
				extraElement: { type: "dock", x: 50, y: 20, rotation: 0 },
			},
		],
	},
];
