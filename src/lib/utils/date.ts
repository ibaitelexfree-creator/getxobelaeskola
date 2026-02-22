/**
 * Utility to handle date and time in Spain timezone.
 */
export function getSpainTimeInfo(date: Date = new Date()) {
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Madrid",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const parts = formatter.formatToParts(date);
	const getPart = (type: string) =>
		parts.find((p) => p.type === type)?.value || "";

	return {
		year: parseInt(getPart("year")),
		month: parseInt(getPart("month")),
		day: parseInt(getPart("day")),
		hour: parseInt(getPart("hour")),
		minute: parseInt(getPart("minute")),
		dateStr: `${getPart("year")}-${getPart("month")}-${getPart("day")}`,
	};
}

/**
 * Calculates the initial display date for booking.
 * If it's late (past 17:00), it returns tomorrow.
 */
export function getInitialBookingDate(
	nowInfo: ReturnType<typeof getSpainTimeInfo>,
) {
	const lastPossibleHour = 17;
	if (nowInfo.hour >= lastPossibleHour) {
		const d = new Date(nowInfo.year, nowInfo.month - 1, nowInfo.day + 1);
		return {
			day: d.getDate().toString().padStart(2, "0"),
			month: (d.getMonth() + 1).toString().padStart(2, "0"),
			year: d.getFullYear().toString(),
		};
	}
	return {
		day: nowInfo.day.toString().padStart(2, "0"),
		month: nowInfo.month.toString().padStart(2, "0"),
		year: nowInfo.year.toString(),
	};
}

/**
 * Calculates end time string given start time HH:mm and duration in hours.
 */
export function calculateEndTime(
	startTime: string,
	durationHours: number = 1,
): string {
	const [h, m, s] = startTime.split(":").map(Number);
	const endH = h + durationHours;
	// Simple pad, handles daytime rentals. Does not handle overflow past 24h as not expected.
	return `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s || 0).padStart(2, "0")}`;
}
