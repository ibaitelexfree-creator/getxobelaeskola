import { describe, expect, it } from "vitest";
import {
	type Coordinate,
	calculateBearing,
	calculateDistance,
	calculateEta,
	type DMS,
	decimalToDms,
	dmsToDecimal,
} from "./calculator";

describe("Nautical Calculator", () => {
	describe("dmsToDecimal", () => {
		it("converts N/E coordinates correctly", () => {
			const dms: DMS = {
				degrees: 43,
				minutes: 20,
				seconds: 30,
				direction: "N",
			};
			// 43 + 20/60 + 30/3600 = 43.341666...
			expect(dmsToDecimal(dms)).toBeCloseTo(43.341667, 4);
		});

		it("converts S/W coordinates correctly (negative)", () => {
			const dms: DMS = { degrees: 3, minutes: 0, seconds: 0, direction: "W" };
			expect(dmsToDecimal(dms)).toBeCloseTo(-3.0, 5);
		});
	});

	describe("decimalToDms", () => {
		it("converts positive decimal to DMS", () => {
			const decimal = 43.34166666;
			const dms = decimalToDms(decimal, true);
			// Expect close values due to floating point
			expect(dms.degrees).toBe(43);
			expect(dms.minutes).toBe(20);
			expect(dms.seconds).toBeCloseTo(30, 0);
			expect(dms.direction).toBe("N");
		});

		it("converts negative decimal to DMS", () => {
			const decimal = -3.5;
			const dms = decimalToDms(decimal, false);
			expect(dms).toEqual({
				degrees: 3,
				minutes: 30,
				seconds: 0.0,
				direction: "W",
			});
		});
	});

	describe("calculateDistance", () => {
		it("calculates distance between two points", () => {
			// Approx distance between (0,0) and (0,1) should be 60 NM
			const start: Coordinate = { lat: 0, lon: 0 };
			const end: Coordinate = { lat: 0, lon: 1 };
			const dist = calculateDistance(start, end);
			expect(dist).toBeCloseTo(60, 0); // 1 degree of longitude at equator is 60nm
		});
	});

	describe("calculateBearing", () => {
		it("calculates True Bearing correctly", () => {
			const start: Coordinate = { lat: 0, lon: 0 };
			const end: Coordinate = { lat: 1, lon: 0 }; // North
			const bearing = calculateBearing(start, end);
			expect(bearing.trueBearing).toBe(0);
		});

		it("calculates Magnetic Bearing correctly with variation", () => {
			const start: Coordinate = { lat: 0, lon: 0 };
			const end: Coordinate = { lat: 1, lon: 0 }; // True North (0)
			// Variation 5E (+5) -> Magnetic = 0 - 5 = -5 -> 355
			const res1 = calculateBearing(start, end, 5);
			expect(res1.magneticBearing).toBe(355);

			// Variation 5W (-5) -> Magnetic = 0 - (-5) = 5
			const res2 = calculateBearing(start, end, -5);
			expect(res2.magneticBearing).toBe(5);
		});
	});

	describe("calculateEta", () => {
		it("calculates ETA correctly", () => {
			const dist = 100;
			const speed = 10;
			const eta = calculateEta(dist, speed);
			expect(eta).toEqual({
				days: 0,
				hours: 10,
				minutes: 0,
				totalHours: 10,
			});
		});

		it("handles days correctly", () => {
			const dist = 240;
			const speed = 5;
			const eta = calculateEta(dist, speed);
			// 48 hours = 2 days
			expect(eta).toEqual({
				days: 2,
				hours: 0,
				minutes: 0,
				totalHours: 48,
			});
		});

		it("handles rounding edge cases correctly (1.999 hours)", () => {
			// 1.999 hours -> ~119.94 mins -> rounds to 120 mins -> 2 hours 0 mins
			const dist = 1.999;
			const speed = 1;
			const eta = calculateEta(dist, speed);
			expect(eta).toEqual({
				days: 0,
				hours: 2,
				minutes: 0,
				totalHours: 2.0,
			});
		});
	});
});
