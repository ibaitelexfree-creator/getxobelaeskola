import { differenceInMinutes, isSameWeek, parseISO } from "date-fns";
import { Settings, Target } from "lucide-react";
import React, { useState } from "react";
import type { StudyGoal, StudySession } from "./types";

interface GoalProgressProps {
	sessions: StudySession[];
	goal: StudyGoal | null;
	currentDate: Date;
	onUpdateGoal: (minutes: number) => void;
}

export default function GoalProgress({
	sessions,
	goal,
	currentDate,
	onUpdateGoal,
}: GoalProgressProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [goalInput, setGoalInput] = useState(
		goal?.weekly_goal_minutes ? String(goal.weekly_goal_minutes / 60) : "0",
	);

	// Calculate actual minutes for the current week
	const currentWeekSessions = sessions.filter((session) => {
		const start = parseISO(session.start_time);
		return isSameWeek(start, currentDate, { weekStartsOn: 1 });
	});

	const totalMinutes = currentWeekSessions.reduce((acc, session) => {
		const start = parseISO(session.start_time);
		const end = parseISO(session.end_time);
		return acc + differenceInMinutes(end, start);
	}, 0);

	const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
	const goalMinutes = goal?.weekly_goal_minutes || 0;
	const goalHours = Math.round((goalMinutes / 60) * 10) / 10;

	const percentage =
		goalMinutes > 0 ? Math.min(100, (totalMinutes / goalMinutes) * 100) : 0;

	const handleSave = () => {
		const newGoalHours = parseFloat(goalInput);
		if (!isNaN(newGoalHours) && newGoalHours >= 0) {
			onUpdateGoal(newGoalHours * 60);
		}
		setIsEditing(false);
	};

	return (
		<div className="bg-card/30 border border-white/10 rounded-lg p-6 flex flex-col justify-between h-full">
			<div className="flex justify-between items-start mb-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
						<Target size={20} />
					</div>
					<div>
						<h3 className="text-sm font-bold text-white uppercase tracking-wider">
							Objetivo Semanal
						</h3>
						<p className="text-xs text-white/50">Progreso de estudio</p>
					</div>
				</div>
				<button
					onClick={() => setIsEditing(!isEditing)}
					className="text-white/30 hover:text-white transition-colors"
				>
					<Settings size={16} />
				</button>
			</div>

			{isEditing ? (
				<div className="mb-4 animate-in fade-in slide-in-from-top-2">
					<label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">
						Horas Objetivo
					</label>
					<div className="flex gap-2">
						<input
							type="number"
							value={goalInput}
							onChange={(e) => setGoalInput(e.target.value)}
							className="w-full bg-white/5 border border-white/10 rounded p-2 text-white text-sm focus:border-accent focus:outline-none"
							min="0"
							step="0.5"
						/>
						<button
							onClick={handleSave}
							className="bg-accent text-nautical-black font-bold text-xs px-3 rounded hover:bg-white transition-colors"
						>
							OK
						</button>
					</div>
				</div>
			) : null}

			<div className="space-y-2 mt-auto">
				<div className="flex justify-between items-end">
					<span className="text-2xl font-display font-bold text-white italic">
						{totalHours}{" "}
						<span className="text-sm not-italic font-normal text-white/40">
							/ {goalHours} h
						</span>
					</span>
					<span className="text-accent font-bold text-sm">
						{Math.round(percentage)}%
					</span>
				</div>

				<div className="h-2 bg-white/5 rounded-full overflow-hidden">
					<div
						className="h-full bg-accent transition-all duration-1000 ease-out"
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
