import { describe, expect, it } from "vitest";
import { getInitialBookingDate, getSpainTimeInfo } from "./date";

describe("getSpainTimeInfo", () => {
	it("returns correct structure", () => {
		const info = getSpainTimeInfo();
		expect(info).toHaveProperty("year");
		expect(info).toHaveProperty("month");
		expect(info).toHaveProperty("day");
		expect(info).toHaveProperty("hour");
		expect(info).toHaveProperty("minute");
		expect(info).toHaveProperty("dateStr");
	});
});

describe("getInitialBookingDate", () => {
	it("returns today if before 17:00", () => {
		const mockNow = {
			year: 2023,
			month: 10,
			day: 15,
			hour: 10, // Before 17
			minute: 0,
			dateStr: "2023-10-15",
		};
		const result = getInitialBookingDate(mockNow);
		expect(result).toEqual({ day: "15", month: "10", year: "2023" });
	});

	it("returns tomorrow if after 17:00", () => {
		const mockNow = {
			year: 2023,
			month: 10,
			day: 15,
			hour: 18, // After 17
			minute: 0,
			dateStr: "2023-10-15",
		};
		const result = getInitialBookingDate(mockNow);
		expect(result).toEqual({ day: "16", month: "10", year: "2023" });
	});

	it("handles month rollover correctly", () => {
		const mockNow = {
			year: 2023,
			month: 10,
			day: 31,
			hour: 18, // After 17
			minute: 0,
			dateStr: "2023-10-31",
		};
		const result = getInitialBookingDate(mockNow);
		expect(result).toEqual({ day: "01", month: "11", year: "2023" });
	});
});
