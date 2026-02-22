import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export class LocalNotificationManager {
	static async requestPermissions() {
		if (!Capacitor.isNativePlatform()) return true;

		const result = await LocalNotifications.requestPermissions();
		return result.display === "granted";
	}

	static async scheduleSessionReminder(session: {
		id: string;
		start_time: string;
		topic?: string;
	}) {
		if (!Capacitor.isNativePlatform()) return;

		const startTime = new Date(session.start_time);
		const notificationTime = new Date(startTime.getTime() - 30 * 60 * 1000); // 30 mins before

		// Don't schedule if time has passed
		if (notificationTime.getTime() < Date.now()) return;

		// Use a consistent ID generation (hash of UUID)
		const id = LocalNotificationManager.hashCode(session.id);

		try {
			await LocalNotifications.schedule({
				notifications: [
					{
						title: "Sesión de Estudio",
						body: `Tu sesión de estudio "${session.topic || "General"}" comienza en 30 minutos.`,
						id: id,
						schedule: { at: notificationTime },
						sound: "beep.wav",
						extra: {
							sessionId: session.id,
						},
					},
				],
			});
			console.log(
				`Scheduled notification for session ${session.id} at ${notificationTime.toISOString()}`,
			);
		} catch (e) {
			console.error("Failed to schedule notification", e);
		}
	}

	static async cancelSessionReminder(sessionId: string) {
		if (!Capacitor.isNativePlatform()) return;
		const id = LocalNotificationManager.hashCode(sessionId);
		try {
			await LocalNotifications.cancel({ notifications: [{ id }] });
		} catch (e) {
			console.warn("Failed to cancel notification (might not exist)", e);
		}
	}

	private static hashCode(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		// Ensure strictly positive integer within safe range for Android
		return Math.abs(hash) % 2147483647;
	}
}
