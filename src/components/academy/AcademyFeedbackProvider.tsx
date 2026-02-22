"use client";

import type React from "react";
import AchievementToast from "@/components/academy/notifications/AchievementToast";
import SkillUnlockedModal from "@/components/academy/notifications/SkillUnlockedModal";

/**
 * AcademyFeedbackProvider - Wrapper component that includes all feedback UI
 * Add this to the root layout to enable academy notifications globally
 */
export default function AcademyFeedbackProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{children}
			<AchievementToast />
			<SkillUnlockedModal />
		</>
	);
}
