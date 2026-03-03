"use client";

import { useEffect } from "react";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";
import { createClient } from "@/lib/supabase/client";

export default function SmartNotificationManager() {
	const {
		requestLocalPermissions,
		scheduleStreakReminder,
		scheduleExamReminders,
		listenToModuleCompletion,
	} = useSmartNotifications();

	const supabase = createClient();

	useEffect(() => {
		let cleanupListener: (() => void) | undefined;

		const init = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			await requestLocalPermissions();
			await scheduleStreakReminder(user.id);
			await scheduleExamReminders(user.id);

			cleanupListener = listenToModuleCompletion(user.id);
		};

		init();

		return () => {
			if (cleanupListener) cleanupListener();
		};
	}, [
		requestLocalPermissions,
		scheduleStreakReminder,
		scheduleExamReminders,
		listenToModuleCompletion,
		supabase,
	]);

	return null; // Logic-only component
}
