"use client";

import { Check, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useNotificationStore } from "@/lib/store/useNotificationStore";

interface ShareButtonProps {
	title: string;
	text: string;
	url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
	const t = useTranslations("profile");
	const { addNotification } = useNotificationStore();
	const [copied, setCopied] = useState(false);

	const shareUrl =
		url || (typeof window !== "undefined" ? window.location.href : "");

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title,
					text,
					url: shareUrl,
				});
			} catch (err) {
				// User cancelled or error
				console.debug("Share cancelled or failed", err);
			}
		} else {
			try {
				await navigator.clipboard.writeText(shareUrl);
				setCopied(true);
				addNotification({
					type: "success",
					title: t("link_copied"),
					message: "URL copiada al portapapeles",
					duration: 3000,
				});
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error("Error copying:", err);
				addNotification({
					type: "error",
					title: t("share_error"),
					message: "No se pudo copiar al portapapeles",
					duration: 3000,
				});
			}
		}
	};

	return (
		<button
			onClick={handleShare}
			className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white text-sm font-medium backdrop-blur-sm border border-white/10"
			aria-label={t("share")}
		>
			{copied ? (
				<Check size={16} className="text-emerald-400" />
			) : (
				<Share2 size={16} />
			)}
			<span>{copied ? t("link_copied") : t("share")}</span>
		</button>
	);
}
