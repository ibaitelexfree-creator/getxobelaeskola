"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { LocalNotificationManager } from "@/lib/notifications/LocalNotificationManager";
import { getApiUrl } from "@/lib/platform";
import AddSessionModal from "./AddSessionModal";
import PlannerGoalWidget from "./PlannerGoalWidget";
import PlannerWeekView from "./PlannerWeekView";
import type { StudySession } from "./types";

export default function PlannerContainer({ locale }: { locale: string }) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [plans, setPlans] = useState<StudySession[]>([]);
	const [weeklyGoal, setWeeklyGoal] = useState(0);
	const [actualMinutes, setActualMinutes] = useState(0);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] = useState(true);

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedSession, setSelectedSession] = useState<
		StudySession | undefined
	>(undefined);

	const getWeekRange = useCallback((date: Date) => {
		const start = new Date(date);
		const day = start.getDay(); // 0 is Sunday
		const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
		start.setDate(diff);
		start.setHours(0, 0, 0, 0);

		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);

		return { start, end };
	}, []);

	const fetchPlannerData = useCallback(async () => {
		setLoading(true);
		try {
			const { start, end } = getWeekRange(currentDate);
			const res = await fetch(
				getApiUrl(
					`/api/student/study-planner?start_date=${start.toISOString()}&end_date=${end.toISOString()}`,
				),
			);
			const data = await res.json();

			if (data.plans) setPlans(data.plans);
			if (data.weekly_goal) setWeeklyGoal(data.weekly_goal);
			if (data.actual_minutes) setActualMinutes(data.actual_minutes);
		} catch (error) {
			console.error("Failed to fetch planner data", error);
		} finally {
			setLoading(false);
		}
	}, [currentDate, getWeekRange]);

	useEffect(() => {
		fetchPlannerData();
		LocalNotificationManager.requestPermissions();
	}, [fetchPlannerData]);

	const handleSaveSession = async (session: Partial<StudySession>) => {
		const method = session.id ? "PUT" : "POST";
		const res = await fetch(getApiUrl("/api/student/study-planner"), {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(session),
		});

		if (res.ok) {
			const savedSession = await res.json();
			// Schedule notification
			if (savedSession && savedSession.start_time) {
				// Ensure type compatibility for the notification manager
				await LocalNotificationManager.scheduleSessionReminder({
					id: savedSession.id,
					start_time: savedSession.start_time,
					topic: savedSession.topic,
				});
			}
			fetchPlannerData();
		}
	};

	const handleDeleteSession = async (id: string) => {
		const res = await fetch(getApiUrl(`/api/student/study-planner?id=${id}`), {
			method: "DELETE",
		});
		if (res.ok) {
			await LocalNotificationManager.cancelSessionReminder(id);
			fetchPlannerData();
		}
	};

	const handleUpdateGoal = async (goal: number) => {
		await fetch(getApiUrl("/api/student/study-planner"), {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ weekly_goal: goal }),
		});
		fetchPlannerData();
	};

	// Generate days for view
	const days = [];
	const { start } = getWeekRange(currentDate);
	for (let i = 0; i < 7; i++) {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		days.push(d);
	}

	const changeWeek = (offset: number) => {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + offset * 7);
		setCurrentDate(newDate);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
				<div>
					<h2 className="text-xs uppercase tracking-widest text-accent font-bold mb-2">
						Planificador de Estudio
					</h2>
					<h1 className="text-3xl font-display text-white italic">
						Semana del{" "}
						{days[0].toLocaleDateString(locale, {
							day: "numeric",
							month: "long",
						})}
					</h1>
				</div>

				<div className="flex gap-2">
					<button
						onClick={() => changeWeek(-1)}
						className="p-2 bg-white/5 hover:bg-white/10 rounded-sm text-white transition-colors"
					>
						<ChevronLeft size={20} />
					</button>
					<button
						onClick={() => setCurrentDate(new Date())}
						className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-sm text-white text-xs uppercase tracking-widest font-bold transition-colors"
					>
						Hoy
					</button>
					<button
						onClick={() => changeWeek(1)}
						className="p-2 bg-white/5 hover:bg-white/10 rounded-sm text-white transition-colors"
					>
						<ChevronRight size={20} />
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3">
					<PlannerWeekView
						days={days}
						sessions={plans}
						onAddSession={(date) => {
							setSelectedDate(date);
							setSelectedSession(undefined);
							setIsModalOpen(true);
						}}
						onEditSession={(session) => {
							setSelectedSession(session);
							setSelectedDate(undefined);
							setIsModalOpen(true);
						}}
						// onDeleteSession={handleDeleteSession} // Not used in view directly
					/>
				</div>
				<div className="lg:col-span-1">
					<PlannerGoalWidget
						actualMinutes={actualMinutes}
						goalMinutes={weeklyGoal}
						onUpdateGoal={handleUpdateGoal}
					/>
				</div>
			</div>

			<AddSessionModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveSession}
				onDelete={handleDeleteSession}
				initialDate={selectedDate}
				initialSession={selectedSession}
			/>
		</div>
	);
}
