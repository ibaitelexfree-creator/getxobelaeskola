import { describe, expect, it } from "vitest";
import { calculateEndTime } from "./date";
import { parseAmount } from "./financial";

describe("Financial Utils", () => {
	describe("parseAmount", () => {
		it("parses integers correctly", () => {
			expect(parseAmount(100)).toBe(100);
			expect(parseAmount("100")).toBe(100);
		});

		it("parses decimals with dot", () => {
			expect(parseAmount("10.50")).toBe(10.5);
		});

		it("parses decimals with comma", () => {
			expect(parseAmount("10,50")).toBe(10.5);
		});

		it("handles currency symbols and text", () => {
			expect(parseAmount("€100")).toBe(100);
			expect(parseAmount("100 EUR")).toBe(100);
		});

		it("returns 0 for invalid inputs", () => {
			expect(parseAmount(null)).toBe(0);
			expect(parseAmount(undefined)).toBe(0);
			expect(parseAmount("abc")).toBe(0);
		});
	});
});

describe("Date Utils", () => {
	describe("calculateEndTime", () => {
		it("calculates end time correctly for 1 hour", () => {
			expect(calculateEndTime("10:00")).toBe("11:00:00");
		});

		it("calculates end time correctly for 2 hours", () => {
			expect(calculateEndTime("10:00", 2)).toBe("12:00:00");
		});

		it("handles minutes", () => {
			expect(calculateEndTime("10:30")).toBe("11:30:00");
		});
	});
});
