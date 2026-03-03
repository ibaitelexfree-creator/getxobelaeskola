"use client";

import React, { useEffect, useState } from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";

interface SkillRadarProps {
	skills: {
		subject: string;
		A: number;
		fullMark: number;
	}[];
}

export default function SkillRadar({ skills }: SkillRadarProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted)
		return (
			<div className="bg-white/5 border border-white/10 rounded-xl p-6 h-[400px] flex items-center justify-center">
				<div className="animate-pulse text-white/5">Cargando Radar...</div>
			</div>
		);

	return (
		<div className="bg-white/5 border border-white/10 rounded-xl p-6">
			<h3 className="text-xl font-display italic text-white mb-6 flex items-center gap-3">
				<span className="text-accent">🎯</span> Fortalezas & Debilidades
			</h3>

			<div className="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
						<PolarGrid stroke="rgba(255,255,255,0.1)" />
						<PolarAngleAxis
							dataKey="subject"
							tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
						/>
						<PolarRadiusAxis
							angle={30}
							domain={[0, 100]}
							tick={false}
							axisLine={false}
						/>
						<Radar
							name="Habilidad"
							dataKey="A"
							stroke="#FFBF00"
							fill="#FFBF00"
							fillOpacity={0.3}
						/>
					</RadarChart>
				</ResponsiveContainer>
			</div>

			<p className="text-3xs text-white/30 text-center uppercase tracking-[0.2em] mt-2">
				Basado en el rendimiento de tus actividades y quizzes
			</p>
		</div>
	);
}
