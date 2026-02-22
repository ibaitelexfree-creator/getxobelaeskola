"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResultsPage() {
	const { code } = useParams();
	const router = useRouter();
	const [participants, setParticipants] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchResults = async () => {
			if (!code) return;

			const supabase = createClient();

			// Get Lobby ID from code
			const { data: lobby } = await supabase
				.from("race_lobbies")
				.select("id")
				.eq("code", code)
				.single();

			if (!lobby) {
				setLoading(false);
				return;
			}

			const { data: parts } = await supabase
				.from("race_participants")
				.select("*")
				.eq("lobby_id", lobby.id)
				.order("score", { ascending: false });

			if (parts) setParticipants(parts);
			setLoading(false);
		};

		fetchResults();
	}, [code]);

	if (loading)
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
				CALCULANDO RESULTADOS...
			</div>
		);

	return (
		<div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-sans">
			<h1 className="text-4xl md:text-6xl font-black mb-12 text-cyan-500 uppercase italic tracking-tighter">
				Resultados Finales
			</h1>

			<div className="w-full max-w-3xl bg-gray-900/80 p-8 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-md">
				<table className="w-full text-left">
					<thead>
						<tr className="border-b border-gray-700 text-gray-500 uppercase text-xs tracking-widest">
							<th className="py-4 pl-4">Posición</th>
							<th className="py-4">Piloto</th>
							<th className="py-4 text-right pr-4">Puntuación</th>
						</tr>
					</thead>
					<tbody>
						{participants.map((p, i) => (
							<tr
								key={p.id}
								className="border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors group"
							>
								<td className="py-6 pl-4 font-black text-2xl w-20">
									{i === 0 && (
										<span className="text-yellow-400 text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
											🥇
										</span>
									)}
									{i === 1 && (
										<span className="text-gray-300 text-3xl">🥈</span>
									)}
									{i === 2 && (
										<span className="text-amber-700 text-3xl">🥉</span>
									)}
									{i > 2 && <span className="text-gray-600">{i + 1}º</span>}
								</td>
								<td className="py-6 text-xl font-mono text-gray-300 group-hover:text-white transition-colors">
									{p.username}
									{i === 0 && (
										<span className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded border border-yellow-400/30 uppercase tracking-wide font-bold">
											Ganador
										</span>
									)}
								</td>
								<td className="py-6 pr-4 text-right font-bold text-cyan-400 text-3xl font-mono tracking-tighter">
									{p.score}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<button
				onClick={() => router.push("/academy/competition")}
				className="mt-12 px-8 py-4 bg-gray-800 hover:bg-gray-700 hover:text-cyan-400 rounded-lg text-white font-bold uppercase tracking-widest transition-all hover:scale-105"
			>
				Volver al Menú
			</button>
		</div>
	);
}
