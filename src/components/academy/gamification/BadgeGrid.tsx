import React from "react";
import type { Badge } from "@/hooks/useGamification";
import BadgeCard from "./BadgeCard";

interface BadgeGridProps {
	badges: Badge[];
	loading?: boolean;
	locale: string;
}

export default function BadgeGrid({ badges, loading, locale }: BadgeGridProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
				{[...Array(8)].map((_, i) => (
					<div
						key={i}
						className="h-64 rounded-2xl bg-white/5 border border-white/10"
					/>
				))}
			</div>
		);
	}

	if (badges.length === 0) {
		return (
			<div className="text-center py-20 text-white/40">
				<p>No se encontraron badges.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{badges.map((badge) => (
				<BadgeCard key={badge.id} badge={badge} locale={locale} />
			))}
		</div>
	);
}
