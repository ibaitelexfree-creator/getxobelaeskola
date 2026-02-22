"use client";

import React from "react";
import {
	type Notification,
	useNotificationStore,
} from "@/lib/store/useNotificationStore";

export default function NotificationContainer() {
	const { notifications, removeNotification } = useNotificationStore();

	// Filter out achievements and skills as they are handled by specialized premium components
	const genericNotifications = notifications.filter(
		(n) => n.type !== "achievement" && n.type !== "skill",
	);

	return (
		<div
			className={`fixed bottom-6 right-6 z-[100] flex flex-col gap-4 w-full ${genericNotifications.some((n) => n.type === "info") ? "max-w-md" : "max-w-sm"} pointer-events-none transition-all duration-500`}
		>
			{genericNotifications.map((n) => (
				<NotificationItem
					key={n.id}
					notification={n}
					onDismiss={() => removeNotification(n.id)}
				/>
			))}
		</div>
	);
}

function NotificationItem({
	notification,
	onDismiss,
}: {
	notification: Notification;
	onDismiss: () => void;
}) {
	const isSpecial =
		notification.type === "achievement" || notification.type === "skill";
	const isInfo = notification.type === "info";

	return (
		<div
			className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-8 duration-500 p-5 ${
				isSpecial
					? "bg-accent/10 border-accent/40 text-white"
					: isInfo
						? "bg-accent/10 border-accent/30 text-white shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]"
						: "bg-white/5 border-white/10 text-white"
			}`}
		>
			{/* Background decoration for special ones */}
			{isSpecial && (
				<div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
			)}

			<div className="flex gap-4">
				<div
					className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
						isSpecial
							? "bg-accent text-nautical-black"
							: "bg-white/10 text-accent"
					}`}
				>
					<span
						role="img"
						aria-label={
							notification.type === "achievement" ? "logro" : "notificación"
						}
					>
						{notification.icon ||
							(notification.type === "achievement" ? "🏆" : "⚡")}
					</span>
				</div>

				<div className="flex-1 min-w-0">
					<h4
						className={`font-display italic font-bold tracking-tight ${notification.type === "info" ? "text-lg" : ""}`}
					>
						{notification.title}
					</h4>
					<p
						className={`${notification.type === "info" ? "text-base" : "text-sm"} text-white/60 leading-tight`}
					>
						{notification.message}
					</p>
				</div>

				<button
					onClick={onDismiss}
					className="h-6 w-6 text-white/20 hover:text-white transition-colors"
					aria-label="Cerrar notificación"
				>
					✕
				</button>
			</div>

			{/* Progress bar for auto-dismiss */}
			{notification.duration !== 0 && (
				<div
					className="absolute bottom-0 left-0 h-1 bg-accent/40 w-full animate-shrink-x"
					style={{ animationDuration: `${notification.duration || 5000}ms` }}
				/>
			)}
		</div>
	);
}
