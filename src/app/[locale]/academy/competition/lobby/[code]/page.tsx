"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMultiplayerStore } from "@/lib/store/useMultiplayerStore";
import { createClient } from "@/lib/supabase/client";

export default function LobbyPage() {
	const { code } = useParams();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	const lobby = useMultiplayerStore((state) => state.lobby);
	const participants = useMultiplayerStore((state) => state.participants);
	const joinLobby = useMultiplayerStore((state) => state.joinLobby);
	const startGame = useMultiplayerStore((state) => state.startGame);
	const isHost = useMultiplayerStore((state) => state.isHost);
	const playerId = useMultiplayerStore((state) => state.playerId);

	useEffect(() => {
		const init = async () => {
			if (!code) return;

			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				// Redirect to login or landing
				router.push("/academy/competition");
				return;
			}

			// If store doesn't have this lobby, join/fetch it
			// We use 'waiting' status check to avoid re-joining if we are already in
			if (!lobby || lobby.code !== code) {
				const success = await joinLobby(
					code as string,
					user.id,
					user.email?.split("@")[0] || "Skipper",
				);
				if (!success) {
					router.push("/academy/competition");
				}
			}
			setLoading(false);
		};

		init();
	}, [code, lobby, joinLobby, router]);

	// Watch for game start
	useEffect(() => {
		if (lobby?.status === "racing") {
			router.push(`/academy/competition/race/${code}`);
		}
	}, [lobby?.status, code, router]);

	if (loading)
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
				CARGANDO...
			</div>
		);
	if (!lobby)
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
				SALA NO ENCONTRADA
			</div>
		);

	return (
		<div className="min-h-screen bg-black text-white p-8 font-sans flex flex-col items-center justify-center">
			<div className="w-full max-w-4xl">
				<h1 className="text-6xl font-black italic tracking-tighter text-cyan-500 mb-2">
					LOBBY
				</h1>
				<h2 className="text-2xl font-mono text-gray-400 mb-8 tracking-[0.5em]">
					{code}
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl backdrop-blur-sm shadow-2xl">
						<h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-cyan-400 uppercase tracking-wider">
							Participantes ({participants.length}/6)
						</h3>
						<ul className="space-y-3">
							{participants.map((p) => (
								<li
									key={p.id}
									className="flex justify-between items-center bg-black/40 p-3 rounded border border-gray-800 hover:border-cyan-900 transition-colors group"
								>
									<span className="font-mono text-lg text-gray-300 group-hover:text-white transition-colors">
										{p.username}
									</span>
									<div className="flex items-center">
										{p.user_id === lobby.host_id && (
											<span className="text-[10px] bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 px-2 py-1 rounded font-bold uppercase tracking-wider mr-2">
												Host
											</span>
										)}
										{p.user_id === playerId && (
											<span className="text-[10px] bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded font-bold uppercase tracking-wider">
												TÚ
											</span>
										)}
									</div>
								</li>
							))}
						</ul>
					</div>

					<div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl backdrop-blur-sm flex flex-col justify-between shadow-2xl">
						<div>
							<h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-cyan-400 uppercase tracking-wider">
								Configuración
							</h3>
							<div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
								<div className="uppercase tracking-wide text-xs font-bold text-gray-500">
									Viento
								</div>
								<div className="text-white font-mono text-right">
									{Math.round(lobby.settings.wind_speed || 12)} kts
								</div>
								<div className="uppercase tracking-wide text-xs font-bold text-gray-500">
									Dirección
								</div>
								<div className="text-white font-mono text-right">
									{Math.round(lobby.settings.wind_direction || 45)}°
								</div>
								<div className="uppercase tracking-wide text-xs font-bold text-gray-500">
									Vueltas
								</div>
								<div className="text-white font-mono text-right">
									{lobby.settings.laps || 1}
								</div>
							</div>
						</div>

						{isHost ? (
							<button
								onClick={() => startGame()}
								className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 px-6 rounded-lg text-xl uppercase tracking-widest mt-8 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98]"
							>
								INICIAR REGATA
							</button>
						) : (
							<div className="mt-8 text-center animate-pulse text-cyan-400 font-mono tracking-widest uppercase text-sm">
								Esperando al anfitrión...
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
