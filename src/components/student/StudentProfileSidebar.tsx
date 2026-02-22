"use client";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { apiUrl } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import EditProfileModal from "./EditProfileModal";

interface Profile {
	id: string;
	nombre: string;
	apellidos: string;
	telefono: string;
	rol: string;
	status_socio?: string;
	xp?: number;
	total_xp?: number;
}

interface StudentProfileSidebarProps {
	profile: Profile;
	email: string;
	locale: string;
}

export default function StudentProfileSidebar({
	profile,
	email,
	locale,
}: StudentProfileSidebarProps) {
	const t = useTranslations("profile_sidebar");
	const [isEditing, setIsEditing] = useState(false);
	const [currentProfile, setCurrentProfile] = useState<Profile>(profile);
	const [portalLoading, setPortalLoading] = useState(false);

	// Scroll to top on mount
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	const handleManageMembership = async () => {
		try {
			setPortalLoading(true);
			const res = await fetch(apiUrl("/api/membership/portal"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ locale }),
			});
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				alert(data.error || t("portal_error"));
			}
		} catch (error) {
			console.error("Portal error:", error);
			alert(t("connection_error"));
		} finally {
			setPortalLoading(false);
		}
	};

	const isSocio = currentProfile?.status_socio === "activo";

	return (
		<aside className="space-y-8">
			<div className="bg-card p-8 border border-card-border rounded-sm backdrop-blur-md">
				<div className="flex flex-col items-center text-center mb-8">
					<div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent/20 mb-4 bg-white/5">
						<Image
							src="/images/default-student-avatar.png"
							alt={currentProfile?.nombre || "Student"}
							fill
							className="object-cover"
						/>
					</div>
					<h3 className="text-xl font-display italic text-white">
						{currentProfile?.nombre} {currentProfile?.apellidos}
					</h3>
					<div className="flex flex-col items-center gap-2 mt-2">
						<span className="text-[8px] uppercase tracking-[0.4em] text-accent font-black">
							{t("verified_member")}
						</span>
						{isSocio && (
							<div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 border border-yellow-200 shadow-[0_0_15px_rgba(252,211,77,0.5)] flex items-center gap-2 animate-pulse mt-1">
								<Sparkles className="w-3 h-3 text-yellow-900" />
								<span className="text-yellow-900 text-[9px] font-black uppercase tracking-widest">
									{t("official_partner")}
								</span>
							</div>
						)}
					</div>

					<div className="mt-6 flex flex-col items-center gap-1">
						<div className="text-2xl font-black text-white italic tracking-tighter">
							{currentProfile?.xp || 0}{" "}
							<span className="text-accent text-xs">XP</span>
						</div>
						<div className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">
							Puntos de Experiencia
						</div>
					</div>
				</div>

				<h3 className="text-3xs uppercase tracking-widest text-white/40 mb-6 font-bold">
					{t("account_info")}
				</h3>
				<div className="space-y-4">
					<div>
						<p className="text-3xs uppercase tracking-widest text-foreground/40">
							Email
						</p>
						<p className="text-sm font-light">{email}</p>
					</div>
					<div>
						<p className="text-3xs uppercase tracking-widest text-foreground/40">
							{t("role")}
						</p>
						<p
							className="text-sm font-light uppercase tracking-wider"
							title="Tu nivel de acceso actual en el sistema de la escuela."
						>
							{currentProfile?.rol || t("student")}
						</p>
					</div>
				</div>

				<div className="mt-8 space-y-4">
					<button
						onClick={() => setIsEditing(true)}
						className="w-full py-3 border border-white/5 text-3xs uppercase tracking-widest hover:bg-white/5 transition-colors text-white/60 hover:text-white"
					>
						{t("edit_profile")}
					</button>

					{isSocio && (
						<div className="space-y-2">
							<button
								onClick={handleManageMembership}
								disabled={portalLoading}
								className="w-full py-3 bg-white/5 border border-accent/20 text-[9px] uppercase tracking-widest font-bold text-accent hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
							>
								{portalLoading
									? t("loading")
									: `⚙️ ${t("managing_subscription")}`}
							</button>
							<Link
								href={`/${locale}/student/membership/card`}
								className="w-full py-3 bg-brass-gold/10 border border-brass-gold/30 text-[9px] uppercase tracking-widest font-bold text-brass-gold hover:bg-brass-gold/20 transition-all flex items-center justify-center gap-2"
							>
								🆔 {t("membership_card")}
							</Link>
						</div>
					)}

					<div className="pt-4 border-t border-white/5">
						<LogoutButton locale={locale} />
					</div>
				</div>
			</div>

			{/* Edit Modal */}
			<EditProfileModal
				isOpen={isEditing}
				onClose={() => setIsEditing(false)}
				profile={currentProfile}
				onProfileUpdate={(updated) => {
					setCurrentProfile(updated);
					setIsEditing(false);
				}}
			/>
		</aside>
	);
}
