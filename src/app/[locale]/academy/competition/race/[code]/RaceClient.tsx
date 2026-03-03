"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
	const [playerName, setPlayerName] = useState("");
	const [userId, setUserId] = useState<string | null>(null);
	const [matchStarted, setMatchStarted] = useState(false);

	const syncState = useMultiplayerStore((state) => state.syncState);
	const updateScore = useMultiplayerStore((state) => state.updateScore);
	const finishMatch = useMultiplayerStore((state) => state.finishMatch);
	const currentMatch = useMultiplayerStore((state) => state.currentMatch);

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

			// Find our username from match participants
			const me = currentMatch?.participants.find((p) => p.user_id === user.id);
			if (me) {
				setPlayerName(me.username);
			}

			setMatchStarted(true);
		};

		init();
	}, [router, currentMatch]);

	if (!matchStarted || !userId || !code) {
		return <SimulatorSkeleton />;
	}

	return (
		<div className="h-screen w-screen overflow-hidden bg-black relative">
			<SailingSimulator
				playerName={playerName}
				onScoreUpdate={(score) => updateScore(userId, score)}
				onFinish={() => finishMatch(userId)}
				multiplayerMode={true}
				matchCode={code as string}
			/>

			{/* HUD minimal para competición */}
			<div className="absolute top-4 right-4 pointer-events-none">
				<div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg">
					<h3 className="text-cyan-400 text-xs font-bold uppercase mb-2">
						Líderes
					</h3>
					<div className="space-y-1">
						{currentMatch?.participants
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
