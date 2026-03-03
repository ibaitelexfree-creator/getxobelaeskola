"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardRefresh({ hasData }: { hasData: boolean }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const success = searchParams.get("success") === "true";
	const [retries, setRetries] = useState(0);
	const MAX_RETRIES = 3;

	useEffect(() => {
		// If we just had a successful payment but NO data is found yet,
		// it means the webhook is likely still processing.
		// We poll a few times by refreshing the page.
		if (success && !hasData && retries < MAX_RETRIES) {
			const timer = setTimeout(() => {
				setRetries((prev) => prev + 1);
				router.refresh(); // Triggers a re-fetch of server components
			}, 3000); // Wait 3 seconds between retries

			return () => clearTimeout(timer);
		}
	}, [success, hasData, retries, router]);

	if (success && !hasData && retries < MAX_RETRIES) {
		return (
			<div className="bg-accent/10 border border-accent/20 p-4 rounded mb-8 animate-pulse">
				<p className="text-accent text-xs font-bold uppercase tracking-widest flex items-center gap-2">
					<span className="inline-block w-2 h-2 bg-accent rounded-full animate-ping" />
					Finalizando tu inscripción... tu curso aparecerá en unos instantes.
				</p>
			</div>
		);
	}

	return null;
}
