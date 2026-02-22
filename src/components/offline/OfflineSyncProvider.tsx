"use client";

import { useEffect, useRef } from "react";
import { offlineSyncManager } from "@/lib/offline/sync-manager";
import { useNotificationStore } from "@/lib/store/useNotificationStore";

export default function OfflineSyncProvider() {
	const { addNotification } = useNotificationStore();
	const isFirstMount = useRef(true);

	useEffect(() => {
		const handleOnline = () => {
			console.log("[OfflineSync] Online detected. Checking queue...");
			const queue = offlineSyncManager.getQueue();

			if (queue.length > 0) {
				addNotification({
					type: "info",
					title: "Conexión recuperada",
					message: "Sincronizando datos guardados...",
					icon: "wifi",
					duration: 3000,
				});

				offlineSyncManager.processQueue().then(() => {
					// Could notify success if we want, but info is enough for now
				});
			}
		};

		window.addEventListener("online", handleOnline);

		// Process on mount if online
		if (typeof navigator !== "undefined" && navigator.onLine) {
			// Check if queue has items before notifying/processing on mount to avoid noise
			if (offlineSyncManager.getQueue().length > 0) {
				if (isFirstMount.current) {
					// Optional: notify on load if pending items? Maybe too noisy.
					// Just process silently on load.
					offlineSyncManager.processQueue();
					isFirstMount.current = false;
				}
			}
		}

		return () => {
			window.removeEventListener("online", handleOnline);
		};
	}, [addNotification]);

	return null;
}
