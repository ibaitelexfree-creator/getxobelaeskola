import { useMemo } from "react";

export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
	isPadding: boolean;
}

/**
 * Hook to generate a 42-cell grid (6 weeks) for a given date.
 * Ensures the grid is always full even if the month starts on a Sunday or ends on a Saturday.
 */
export function useCalendarGrid(currentDate: Date) {
	const grid = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		// First day of current month
		const firstDayOfMonth = new Date(year, month, 1);
		// Day of week for first day (0-6, where 0 is Sunday)
		// We want Monday as start of week (0: Mon, ..., 6: Sun)
		let firstDayWeekday = firstDayOfMonth.getDay() - 1;
		if (firstDayWeekday === -1) firstDayWeekday = 6; // Sunday fix

		// Last day of current month
		const lastDayOfMonth = new Date(year, month + 1, 0);

		const days: CalendarDay[] = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// 1. Padding from previous month
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = firstDayWeekday - 1; i >= 0; i--) {
			const date = new Date(year, month - 1, prevMonthLastDay - i);
			days.push({
				date,
				isCurrentMonth: false,
				isToday: date.getTime() === today.getTime(),
				isPadding: true,
			});
		}

		// 2. Current month days
		const daysInMonth = lastDayOfMonth.getDate();
		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(year, month, i);
			days.push({
				date,
				isCurrentMonth: true,
				isToday: date.getTime() === today.getTime(),
				isPadding: false,
			});
		}

		// 3. Padding from next month to fill 42 cells (6 rows)
		const totalCells = 42;
		const remainingCells = totalCells - days.length;
		for (let i = 1; i <= remainingCells; i++) {
			const date = new Date(year, month + 1, i);
			days.push({
				date,
				isCurrentMonth: false,
				isToday: date.getTime() === today.getTime(),
				isPadding: true,
			});
		}

		return days;
	}, [currentDate]);

	return grid;
}
