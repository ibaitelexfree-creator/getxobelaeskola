"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OfflineIndicator() {
	const [isOnline, setIsOnline] = useState(true);
	const [showRestored, setShowRestored] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Check initial status
		if (typeof window !== "undefined") {
			setIsOnline(navigator.onLine);
		}

		const handleOnline = () => {
			setIsOnline(true);
			setShowRestored(true);

			// Auto-sync: Refresh the page data when connection is restored
			console.log("Conexión restaurada: Sincronizando...");
			router.refresh();

			// Hide the restored message after 4 seconds
			setTimeout(() => setShowRestored(false), 4000);
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [router]);

	if (isOnline && !showRestored) return null;

	return (
		<div
			className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-500 transform animate-in fade-in slide-in-from-bottom-4 ${
				!isOnline
					? "bg-red-600/95 backdrop-blur-sm text-white border border-red-400/50"
					: "bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-400/50"
			}`}
		>
			{!isOnline ? (
				<>
					<WifiOff className="h-5 w-5 animate-pulse" />
					<div className="flex flex-col leading-tight">
						<span className="font-bold text-sm">Sin conexión</span>
						<span className="text-[10px] opacity-90 font-medium">
							Modo offline activo
						</span>
					</div>
				</>
			) : (
				<>
					<Wifi className="h-5 w-5" />
					<div className="flex flex-col leading-tight">
						<span className="font-bold text-sm">Conexión restaurada</span>
						<span className="text-[10px] opacity-90 font-medium">
							Sincronizando datos...
						</span>
					</div>
				</>
			)}
		</div>
	);
}
