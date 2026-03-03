import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OpponentState, RegattaMatch } from "@/types/regatta";

interface UseRegattaSocketResult {
	opponents: OpponentState[];
	matchStatus: RegattaMatch["status"];
	isConnected: boolean;
	broadcastState: (state: any) => void;
}

export function useRegattaSocket(
	matchId: string | null,
	userId: string | null,
	username: string | null,
): UseRegattaSocketResult {
	const supabase = createClient();
	const [opponents, setOpponents] = useState<OpponentState[]>([]);
	const [matchStatus, setMatchStatus] =
		useState<RegattaMatch["status"]>("waiting");
	const [isConnected, setIsConnected] = useState(false);

	const channelRef = useRef<RealtimeChannel | null>(null);
	const opponentsMap = useRef<Map<string, OpponentState>>(new Map());
	const lastBroadcastTime = useRef<number>(0);

	useEffect(() => {
		if (!matchId || !userId) {
			setOpponents([]);
			setIsConnected(false);
			return;
		}

		const channel = supabase.channel(`regatta:${matchId}`, {
			config: {
				presence: {
					key: userId,
				},
			},
		});

		channelRef.current = channel;

		channel
			.on(
				"broadcast",
				{ event: "pos" },
				({ payload }: { payload: OpponentState }) => {
					if (payload.userId === userId) return;

					// Update map
					opponentsMap.current.set(payload.userId, payload);

					// Update state
					// Since this runs frequently, we might want to optimize.
					// But for React rendering, setting state triggers update.
					setOpponents(Array.from(opponentsMap.current.values()));
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "regatta_matches",
					filter: `id=eq.${matchId}`,
				},
				(payload: any) => {
					const newStatus = (payload.new as RegattaMatch).status;
					setMatchStatus(newStatus);
				},
			)
			.subscribe((status: string) => {
				if (status === "SUBSCRIBED") {
					setIsConnected(true);
				}
			});

		return () => {
			supabase.removeChannel(channel);
			setIsConnected(false);
			channelRef.current = null;
		};
	}, [matchId, userId]);

	const broadcastState = (payload: any) => {
		if (!channelRef.current || !userId) return;

		const now = performance.now();
		if (now - lastBroadcastTime.current < 50) return; // Limit to 20Hz (50ms)

		// Construct simplified payload
		const opponentState: OpponentState = {
			userId,
			username: username || "Unknown",
			position: {
				x: payload.boatState.position.x,
				y: payload.boatState.position.y,
				z: payload.boatState.position.z,
			},
			heading: payload.boatState.heading,
			heel: payload.boatState.heel,
			sailAngle: payload.sailAngle || 0, // Expecting worker to provide this
			speed: payload.boatState.speed,
		};

		channelRef.current.send({
			type: "broadcast",
			event: "pos",
			payload: opponentState,
		});

		lastBroadcastTime.current = now;
	};

	return { opponents, matchStatus, isConnected, broadcastState };
}
