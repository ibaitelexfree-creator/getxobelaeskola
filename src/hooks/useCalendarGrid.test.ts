import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCalendarGrid } from "./useCalendarGrid";

describe("useCalendarGrid", () => {
	it("should generate a 42-cell grid", () => {
		const currentDate = new Date(2023, 9, 15); // Oct 15, 2023
		const { result } = renderHook(() => useCalendarGrid(currentDate));

		expect(result.current).toHaveLength(42);
	});

	it("should correctly identify days in the current month", () => {
		const currentDate = new Date(2023, 9, 1); // Oct 1, 2023 (Sunday)
		// Oct 1 is Sunday. In our Monday-start logic:
		// Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6.
		// Sunday fix (0-1 = -1 -> 6). So we expect 6 padding days from Sept.

		const { result } = renderHook(() => useCalendarGrid(currentDate));

		// Sep 25, 26, 27, 28, 29, 30 are padding
		expect(result.current[6].isCurrentMonth).toBe(true); // Oct 1
		expect(result.current[5].isCurrentMonth).toBe(false); // Sep 30
	});

	it("should correctly identify today", () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const { result } = renderHook(() => useCalendarGrid(new Date()));

		const todayCell = result.current.find((day) => day.isToday);
		expect(todayCell).toBeDefined();
		expect(todayCell?.date.getTime()).toBe(today.getTime());
	});

	it("should handle months starting on Monday correctly (no padding from prev month if it starts on Mon?)", () => {
		// May 2023 starts on Monday
		const currentDate = new Date(2023, 4, 1);
		const { result } = renderHook(() => useCalendarGrid(currentDate));

		// Mon May 1 should be index 0
		expect(result.current[0].date.getDate()).toBe(1);
		expect(result.current[0].isCurrentMonth).toBe(true);
	});
});
