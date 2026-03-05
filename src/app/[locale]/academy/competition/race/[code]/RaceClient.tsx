"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { SimulatorSkeleton } from "@/components/academy/sailing-simulator/SimulatorSkeleton";
import { useMultiplayerStore } from "@/lib/store/useMultiplayerStore";
import { createClient } from "@/lib/supabase/client";

const SailingSimulator = dynamic(
	() =>
		import("@/components/academy/sailing-simulator/SailingSimulator").then(
			(mod) => mod.SailingSimulator,
		),
	{
		ssr: false,
		loading: () => <SimulatorSkeleton />,
	},
);

export default function RaceClient() {
	const { code } = useParams();
	const router = useRouter();
	const [userId, setUserId] = useState<string | null>(null);
	const [matchStarted, setMatchStarted] = useState(false);

	const lobby = useMultiplayerStore((state) => state.lobby);
	const participants = useMultiplayerStore((state) => state.participants);
	const joinLobby = useMultiplayerStore((state) => state.joinLobby);
	const broadcastPosition = useMultiplayerStore((state) => state.broadcastPosition);
	const finishRace = useMultiplayerStore((state) => state.finishRace);

	useEffect(() => {
		const init = async () => {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				router.push("/academy/competition");
				return;
			}
			setUserId(user.id);

			// Re-join logic if not in lobby/match (e.g. refresh)
			if (!lobby || lobby.code !== code) {
				const name = user.email?.split("@")[0] || "Skipper";
				const success = await joinLobby(code as string, user.id, name);
				if (!success) {
					router.push("/academy/competition");
					return;
				}
			}

			setMatchStarted(true);
		};

		init();
	}, [router, lobby, code, joinLobby]);

	if (!matchStarted || !userId || !code) {
		return <SimulatorSkeleton />;
	}

	return (
		<div className="h-screen w-screen overflow-hidden bg-black relative">
			<SailingSimulator
				mode="multiplayer"
				lobbyCode={code as string}
				onStateUpdate={(state) => {
					// This state comes from the simulator worker
					if (state.boatState) {
						broadcastPosition({
							position: state.boatState.position,
							heading: state.boatState.rotation?.y || 0,
							sailAngle: 0,
							heel: 0,
							speed: state.boatState.speed,
						});
					}
				}}
			/>

			{/* HUD minimal para competición */}
			<div className="absolute top-4 right-4 pointer-events-none">
				<div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg">
					<h3 className="text-cyan-400 text-xs font-bold uppercase mb-2">
						Líderes
					</h3>
					<div className="space-y-1">
						{participants
							.sort((a, b) => b.score - a.score)
							.slice(0, 3)
							.map((p, i) => (
								<div key={p.id} className="flex justify-between gap-4 text-sm">
									<span className="text-gray-300">
										{i + 1}. {p.username}
									</span>
									<span className="text-cyan-500 font-mono font-bold">
										{p.score}
									</span>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
