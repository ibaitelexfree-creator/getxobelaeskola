// Catálogo de mensajes motivacionales por contexto

export const MOTIVATIONAL_MESSAGES = {
	// Al completar una unidad (lectura + quiz)
	unit_complete: [
		"¡Primer paso dado! Cada milla náutica empieza con una unidad.",
		"El conocimiento es el mejor equipo de seguridad. ¡Sigue así!",
		"Un nudo bien hecho no se deshace. Tu aprendizaje, tampoco.",
		"Navegante constante, llega distante. ¡Buena unidad!",
		"Poco a poco se llega a puerto. Unidad completada.",
	],
	// Al aprobar un quiz/examen (rendimiento)
	quiz_passed: [
		"¡Bien hecho! Tienes el rumbo claro.",
		"¡A la primera! El viento sopla a tu favor.",
		"Has demostrado firmeza al timón. ¡Aprobado!",
		"Conocimiento asegurado. Listo para la siguiente etapa.",
		"¡Excelente maniobra! Has superado la prueba.",
	],
	// Al obtener una nota alta (>= 90%)
	high_score: [
		"¡Impecable! Navegación de precisión.",
		"¡Brillante! Como un faro en la noche.",
		"¡Sobresaliente! Estás hecho un verdadero capitán.",
		"Dominio total. El mar no tiene secretos para ti.",
	],
	// Al suspender
	quiz_failed: [
		"El mar tiene días difíciles. Repasa la teoría y vuelve a intentarlo.",
		"Incluso los mejores capitanes corrigen el rumbo. ¡Ánimo!",
		"No es una derrota, es una lección de navegación. Inténtalo de nuevo.",
		"A veces hay que arriar velas y revisar el mapa. ¡Tú puedes!",
		"La perseverancia es la virtud del marino. ¡Vuelve a intentarlo!",
	],
	// Racha de días (login)
	streak: {
		3: "¡3 días seguidos! El hábito hace al marinero.",
		5: "¡5 días a bordo! Tu constancia es admirable.",
		7: "¡Una semana entera! Navegante constante, futuro brillante.",
		14: "¡Dos semanas sin faltar! Eres parte de la tripulación de élite.",
		30: "¡30 días! El mar es tu segundo hogar.",
	},
	// Desbloqueo de nivel
	level_unlocked: [
		"¡Nuevo horizonte a la vista! Nivel desbloqueado.",
		"El mar se hace más grande, y tú también. ¡Adelante!",
		"Preparado para aguas más profundas. ¡Nivel superado!",
	],
};

export function getMotivationalMessage(
	context: keyof typeof MOTIVATIONAL_MESSAGES,
	score?: number,
): string {
	let messages = MOTIVATIONAL_MESSAGES[context];

	if (context === "quiz_passed" && score && score >= 90) {
		messages = MOTIVATIONAL_MESSAGES.high_score;
	}

	if (Array.isArray(messages)) {
		return messages[Math.floor(Math.random() * messages.length)];
	}

	return "";
}

export function getStreakMessage(days: number): string | null {
	// Buscar el mensaje exacto o el hito más cercano inferior
	const streaks = [30, 14, 7, 5, 3];
	for (const milestone of streaks) {
		if (days === milestone) {
			// @ts-expect-error - milestone is a valid key for streak object
			return MOTIVATIONAL_MESSAGES.streak[milestone];
		}
	}
	return null;
}
