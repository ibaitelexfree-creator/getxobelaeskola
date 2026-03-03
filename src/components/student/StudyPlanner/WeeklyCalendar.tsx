import {
	addDays,
	differenceInMinutes,
	eachDayOfInterval,
	endOfWeek,
	format,
	getHours,
	getMinutes,
	isSameDay,
	parseISO,
	startOfWeek,
	subDays,
} from "date-fns";
import { es, eu } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import React, { useMemo } from "react";
import type { StudySession } from "./types";

interface WeeklyCalendarProps {
	sessions: StudySession[];
	currentDate: Date;
	onDateChange: (date: Date) => void;
	onAddSession: (date: Date, hour: number) => void;
	onEditSession: (session: StudySession) => void;
	locale: string;
}

export default function WeeklyCalendar({
	sessions,
	currentDate,
	onDateChange,
	onAddSession,
	onEditSession,
	locale,
}: WeeklyCalendarProps) {
	const dateLocale = locale === "es" ? es : eu;

	const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
	const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

	const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

	// Scroll to current time on mount (helper ref logic omitted for simplicity, but good for UX)

	const getSessionsForDay = (day: Date) => {
		return sessions.filter((session) => {
			const start = parseISO(session.start_time);
			return isSameDay(start, day);
		});
	};

	const getSessionStyle = (session: StudySession) => {
		const start = parseISO(session.start_time);
		const end = parseISO(session.end_time);
		const startHour = getHours(start);
		const startMinute = getMinutes(start);
		const duration = differenceInMinutes(end, start);

		// Calculate top offset relative to 00:00
		const minutesFromStart = startHour * 60 + startMinute;
		const top = (minutesFromStart / 60) * 60; // 60px per hour
		const height = (duration / 60) * 60;

		return {
			top: `${top}px`,
			height: `${height}px`,
		};
	};

	return (
		<div className="flex flex-col h-[600px] bg-card/30 rounded-lg border border-white/10 overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
				<div className="flex items-center gap-2">
					<button
						onClick={() => onDateChange(subDays(currentDate, 7))}
						className="p-1 text-white/70 hover:bg-white/10 hover:text-white rounded-full transition-colors"
					>
						<ChevronLeft size={20} />
					</button>
					<span className="text-lg font-semibold capitalize text-white font-display">
						{format(weekStart, "MMMM yyyy", { locale: dateLocale })}
					</span>
					<button
						onClick={() => onDateChange(addDays(currentDate, 7))}
						className="p-1 text-white/70 hover:bg-white/10 hover:text-white rounded-full transition-colors"
					>
						<ChevronRight size={20} />
					</button>
				</div>
				<div className="text-sm text-white/50">
					{format(weekStart, "d MMM", { locale: dateLocale })} -{" "}
					{format(weekEnd, "d MMM", { locale: dateLocale })}
				</div>
			</div>

			{/* Calendar Grid */}
			<div className="flex-1 overflow-y-auto custom-scrollbar">
				<div className="grid grid-cols-8 min-w-[800px]">
					{/* Time Column */}
					<div className="border-r border-white/5 bg-black/20 sticky left-0 z-10">
						<div className="h-10 border-b border-white/5"></div>{" "}
						{/* Empty corner */}
						{hours.map((hour) => (
							<div
								key={hour}
								className="h-[60px] border-b border-white/5 flex items-start justify-center pt-1 text-[10px] text-white/40"
							>
								{hour}:00
							</div>
						))}
					</div>

					{/* Days Columns */}
					{weekDays.map((day) => (
						<div
							key={day.toISOString()}
							className="flex flex-col border-r border-white/5 last:border-0 min-w-[100px]"
						>
							{/* Day Header */}
							<div
								className={`h-10 border-b border-white/5 flex flex-col items-center justify-center ${isSameDay(day, new Date()) ? "bg-accent/5" : ""}`}
							>
								<span className="text-[10px] uppercase font-bold text-white/40">
									{format(day, "EEE", { locale: dateLocale })}
								</span>
								<span
									className={`text-sm font-bold ${isSameDay(day, new Date()) ? "text-accent" : "text-white"}`}
								>
									{format(day, "d")}
								</span>
							</div>

							{/* Time Slots */}
							<div className="relative flex-1">
								{hours.map((hour) => (
									<div
										key={hour}
										className="h-[60px] border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative"
										onClick={() => onAddSession(day, hour)}
									>
										<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
											<Plus className="text-accent/50 w-4 h-4" />
										</div>
									</div>
								))}

								{/* Sessions */}
								{getSessionsForDay(day).map((session) => (
									<div
										key={session.id}
										className={`absolute left-1 right-1 rounded p-1 text-xs overflow-hidden cursor-pointer border transition-all hover:scale-[1.02] hover:z-20 z-10 ${session.completed ? "bg-green-500/20 border-green-500/50 text-green-100" : "bg-accent/20 border-accent/50 text-white"}`}
										style={getSessionStyle(session)}
										onClick={(e) => {
											e.stopPropagation();
											onEditSession(session);
										}}
									>
										<div className="font-semibold truncate text-[10px] leading-tight">
											{session.title}
										</div>
										<div className="text-[9px] opacity-70">
											{format(parseISO(session.start_time), "HH:mm")} -{" "}
											{format(parseISO(session.end_time), "HH:mm")}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
