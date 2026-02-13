
import { google } from 'googleapis';

const calendar = google.calendar('v3');

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/calendar']
});

export async function createGoogleEvent(session: any, courseName: string, instructorName: string) {
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) {
        console.warn('Google Calendar credentials missing. Skipping sync.');
        return null;
    }

    try {
        const res = await calendar.events.insert({
            auth,
            calendarId: CALENDAR_ID,
            requestBody: {
                summary: `Clase: ${courseName}`,
                description: `Instructor: ${instructorName}\nObservaciones: ${session.observaciones || 'Ninguna'}`,
                start: {
                    dateTime: new Date(session.fecha_inicio).toISOString(),
                    timeZone: 'Europe/Madrid',
                },
                end: {
                    dateTime: new Date(session.fecha_fin).toISOString(),
                    timeZone: 'Europe/Madrid',
                },
            },
        });
        return res.data.id;
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        return null;
    }
}

export async function updateGoogleEvent(eventId: string, session: any, courseName: string, instructorName: string) {
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID || !eventId) return;

    try {
        await calendar.events.update({
            auth,
            calendarId: CALENDAR_ID,
            eventId: eventId,
            requestBody: {
                summary: `Clase: ${courseName}`,
                description: `Instructor: ${instructorName}\nObservaciones: ${session.observaciones || 'Ninguna'}`,
                start: {
                    dateTime: new Date(session.fecha_inicio).toISOString(),
                    timeZone: 'Europe/Madrid',
                },
                end: {
                    dateTime: new Date(session.fecha_fin).toISOString(),
                    timeZone: 'Europe/Madrid',
                },
            },
        });
    } catch (error) {
        console.error('Error updating Google Calendar event:', error);
    }
}

export async function deleteGoogleEvent(eventId: string) {
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID || !eventId) return;

    try {
        await calendar.events.delete({
            auth,
            calendarId: CALENDAR_ID,
            eventId: eventId,
        });
    } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
    }
}

export async function listGoogleEvents(timeMin?: string, timeMax?: string) {
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) {
        console.warn('Google Calendar credentials missing. Skipping sync.');
        return [];
    }

    try {
        const res = await calendar.events.list({
            auth,
            calendarId: CALENDAR_ID,
            timeMin: timeMin || new Date().toISOString(),
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return res.data.items || [];
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        return [];
    }
}
