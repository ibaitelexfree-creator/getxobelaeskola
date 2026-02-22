"use client";

import { useEffect } from "react";
import { getStreakMessage } from "@/lib/academy/motivational-messages";
import { useNotificationStore } from "@/lib/store/useNotificationStore";
import { createClient } from "@/lib/supabase/client";

export default function ActivityTracker() {
	const supabase = createClient();
	const addNotification = useNotificationStore(
		(state) => state.addNotification,
	);

	useEffect(() => {
		async function trackActivity() {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					// Llamar al RPC para registrar actividad diaria y rachas
					try {
						const { error: rpcError } = await supabase.rpc(
							"registrar_actividad_alumno",
							{ p_alumno_id: user.id },
						);
						if (rpcError) {
							console.warn(
								"Error calling registrar_actividad_alumno:",
								rpcError,
							);
						}
					} catch (err) {
						console.warn(
							"Exception calling registrar_actividad_alumno (RPC might be missing):",
							err,
						);
					}

					// Verificar racha actual para mensaje motivacional
					try {
						const { data: profile, error: profileError } = await supabase
							.from("profiles")
							.select("current_streak")
							.eq("id", user.id)
							.single();

						if (profileError) {
							console.warn("Error fetching profile streak:", profileError);
						} else if (profile?.current_streak) {
							const streakMessage = getStreakMessage(profile.current_streak);
							if (streakMessage) {
								addNotification({
									type: "info",
									title: "¡Racha en llamas! 🔥",
									message: streakMessage,
									icon: "🔥",
									duration: 5000,
								});
							}
						}
					} catch (err) {
						console.warn("Exception fetching profile streak:", err);
					}
				}
			} catch (e) {
				console.error("Error in ActivityTracker:", e);
			}
		}

		trackActivity();
	}, [supabase, addNotification]);

	return null; // Componente invisible
}
