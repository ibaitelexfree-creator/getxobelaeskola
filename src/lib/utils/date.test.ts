import { describe, expect, it } from "vitest";
import { getInitialBookingDate, getSpainTimeInfo } from "./date";

describe("getSpainTimeInfo", () => {
	it("returns segments correctly for a known date", () => {
		// 2024-05-15 10:30 UTC -> 12:30 Madrid (roughly)
		// But Intl.DateTimeFormat handles the conversion.
		const testDate = new Date("2024-05-15T10:30:00Z");
		const info = getSpainTimeInfo(testDate);

		expect(info.year).toBe(2024);
		expect(info.month).toBe(5);
		expect(info.day).toBe(15);
		expect(info.hour).toBe(12); // CEST is UTC+2
		expect(info.minute).toBe(30);
	});
});

describe("getInitialBookingDate", () => {
	it("returns today if it is early", () => {
		const morning = {
			year: 2024,
			month: 5,
			day: 15,
			hour: 10,
			minute: 0,
			dateStr: "2024-05-15",
		};
		const initial = getInitialBookingDate(morning);
		expect(initial.day).toBe("15");
		expect(initial.month).toBe("05");
	});

	it("returns tomorrow if it is late (>= 17:00)", () => {
		const evening = {
			year: 2024,
			month: 5,
			day: 15,
			hour: 18,
			minute: 0,
			dateStr: "2024-05-15",
		};
		const initial = getInitialBookingDate(evening);
		expect(initial.day).toBe("16"); // Tomorrow
		expect(initial.month).toBe("05");
	});
});
