import { google } from "googleapis";
import { calculateEndTime } from "@/lib/utils/date";

const calendar = google.calendar("v3");

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const auth = new google.auth.JWT({
	email: SERVICE_ACCOUNT_EMAIL,
	key: PRIVATE_KEY,
	scopes: ["https://www.googleapis.com/auth/calendar"],
});

const BASE_URL =
	process.env.NEXT_PUBLIC_APP_URL || "https://getxobelaeskola.cloud";

export async function createGoogleEvent(
	session: any,
	courseName: string,
	instructorName: string,
) {
	if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) {
		console.warn("Google Calendar credentials missing. Skipping sync.");
		return null;
	}

	try {
		const adminLink = `${BASE_URL}/es/staff?tab=clases`;

		const res = await calendar.events.insert({
			auth,
			calendarId: CALENDAR_ID,
			requestBody: {
				summary: `Clase: ${courseName}`,
				location: "Puerto Deportivo de Getxo, Bizkaia",
				description: `Instructor: ${instructorName}\nObservaciones: ${session.observaciones || "Ninguna"}\n\n⚙️ Gestionar en Panel: ${adminLink}`,
				start: {
					dateTime: new Date(session.fecha_inicio).toISOString(),
					timeZone: "Europe/Madrid",
				},
				end: {
					dateTime: new Date(session.fecha_fin).toISOString(),
					timeZone: "Europe/Madrid",
				},
				colorId: "7", // Peacock (Blue/Cyan) for Courses
			},
		});
		return res.data.id;
	} catch (error) {
		console.error("Error creating Google Calendar event:", error);
		return null;
	}
}

export async function updateGoogleEvent(
	eventId: string,
	session: any,
	courseName: string,
	instructorName: string,
) {
	if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID || !eventId)
		return;

	try {
		const adminLink = `${BASE_URL}/es/staff?tab=clases`;

		await calendar.events.update({
			auth,
			calendarId: CALENDAR_ID,
			eventId: eventId,
			requestBody: {
				summary: `Clase: ${courseName}`,
				location: "Puerto Deportivo de Getxo, Bizkaia",
				description: `Instructor: ${instructorName}\nObservaciones: ${session.observaciones || "Ninguna"}\n\n⚙️ Gestionar en Panel: ${adminLink}`,
				start: {
					dateTime: new Date(session.fecha_inicio).toISOString(),
					timeZone: "Europe/Madrid",
				},
				end: {
					dateTime: new Date(session.fecha_fin).toISOString(),
					timeZone: "Europe/Madrid",
				},
				colorId: "7",
			},
		});
	} catch (error) {
		console.error("Error updating Google Calendar event:", error);
	}
}

export async function deleteGoogleEvent(eventId: string) {
	if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID || !eventId)
		return;

	try {
		await calendar.events.delete({
			auth,
			calendarId: CALENDAR_ID,
			eventId: eventId,
		});
	} catch (error) {
		console.error("Error deleting Google Calendar event:", error);
	}
}

export async function createRentalGoogleEvent(
	rental: any,
	serviceName: string,
	userName: string,
) {
	if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) {
		console.warn("Google Calendar credentials missing. Skipping sync.");
		return null;
	}

	try {
		// rental.fecha_reserva is YYYY-MM-DD
		// rental.hora_inicio is HH:mm:ss
		const startDateTime = new Date(
			`${rental.fecha_reserva}T${rental.hora_inicio}`,
		);
		const endDateTime = new Date(
			startDateTime.getTime() + (rental.duracion_horas || 1) * 60 * 60 * 1000,
		);
		const adminLink = `${BASE_URL}/es/staff?tab=alquileres`;

		const res = await calendar.events.insert({
			auth,
			calendarId: CALENDAR_ID,
			requestBody: {
				summary: `Alquiler: ${serviceName} - ${userName}`,
				location: "Puerto Deportivo de Getxo, Bizkaia",
				description: `Cliente: ${userName}\nServicio: ${serviceName}\nOpción: ${rental.opcion_seleccionada || "Estándar"}\nMonto: ${rental.monto_total}€\n\n⚙️ Gestionar en Panel: ${adminLink}`,
				start: {
					dateTime: `${rental.fecha_reserva}T${rental.hora_inicio}`,
					timeZone: "Europe/Madrid",
				},
				end: {
					dateTime: `${rental.fecha_reserva}T${calculateEndTime(rental.hora_inicio, rental.duracion_horas || 1)}`,
					timeZone: "Europe/Madrid",
				},
				colorId: "9", // Blueberry (Lavender/Blue-ish) for Rentals
			},
		});
		return res.data.id;
	} catch (error) {
		console.error("Error creating Google Calendar rental event:", error);
		return null;
	}
}

export async function listGoogleEvents(timeMin?: string, timeMax?: string) {
	if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) {
		console.warn("Google Calendar credentials missing. Skipping sync.");
		return [];
	}

	try {
		const res = await calendar.events.list({
			auth,
			calendarId: CALENDAR_ID,
			timeMin: timeMin || new Date().toISOString(),
			timeMax: timeMax,
			singleEvents: true,
			orderBy: "startTime",
		});
		return res.data.items || [];
	} catch (error) {
		console.error("Error fetching Google Calendar events:", error);
		return [];
	}
}
