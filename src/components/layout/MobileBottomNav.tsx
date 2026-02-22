"use client";

import { BookOpen, Compass, GraduationCap, Home, Sailboat } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

interface NavItem {
	label: string;
	labelEu: string;
	labelEn: string;
	labelFr: string;
	icon: React.ReactNode;
	path: string;
}

const navItems: NavItem[] = [
	{
		label: "Inicio",
		labelEu: "Hasiera",
		labelEn: "Home",
		labelFr: "Accueil",
		icon: <Home className="w-5 h-5" />,
		path: "/student/dashboard",
	},
	{
		label: "Cursos",
		labelEu: "Ikastaroak",
		labelEn: "Courses",
		labelFr: "Cours",
		icon: <BookOpen className="w-5 h-5" />,
		path: "/courses",
	},
	{
		label: "Alquiler",
		labelEu: "Alokairuak",
		labelEn: "Rentals",
		labelFr: "Location",
		icon: <Sailboat className="w-5 h-5" />,
		path: "/rental",
	},
	{
		label: "Experiencias",
		labelEu: "Esperientziak",
		labelEn: "Experiences",
		labelFr: "Expériences",
		icon: <Compass className="w-5 h-5" />,
		path: "/experiences",
	},
	{
		label: "Academia",
		labelEu: "Akademia",
		labelEn: "Academy",
		labelFr: "Académie",
		icon: <GraduationCap className="w-5 h-5" />,
		path: "/academy",
	},
];

export default function MobileBottomNav() {
	const pathname = usePathname();
	const params = useParams();
	const locale = (params.locale as string) || "es";

	const isActive = (itemPath: string) => {
		const fullPath = `/${locale}${itemPath}`;
		if (itemPath === "/student/dashboard") {
			return pathname === fullPath || pathname === `/${locale}`;
		}
		return pathname.startsWith(fullPath);
	};

	const getLabel = (item: NavItem) => {
		if (locale === "eu") return item.labelEu;
		if (locale === "en") return item.labelEn;
		if (locale === "fr") return item.labelFr;
		return item.label;
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-nautical-deep/95 backdrop-blur-2xl border-t border-white/5 safe-area-bottom pb-safe transition-all duration-500">
			<div className="flex items-center justify-around h-20 max-w-lg mx-auto px-4 relative">
				{navItems.map((item) => {
					const active = isActive(item.path);
					return (
						<Link
							key={item.path}
							href={`/${locale}${item.path}`}
							prefetch={false}
							aria-current={active ? "page" : undefined}
							aria-label={getLabel(item)}
							className={`flex flex-col items-center justify-center gap-1.5 flex-1 relative transition-all duration-300 ${
								active
									? "text-accent scale-105"
									: "text-white/30 active:scale-95"
							}`}
						>
							<div
								className={`transition-all duration-500 ${active ? "drop-shadow-[0_0_10px_rgba(255,77,0,0.4)]" : "group-hover:text-white/60"}`}
							>
								{item.icon}
							</div>
							<span
								className={`text-[9px] uppercase tracking-[0.2em] font-black transition-all duration-300 ${
									active ? "text-accent" : "text-white/20"
								}`}
							>
								{getLabel(item)}
							</span>

							{/* Active Indicator Glow */}
							{active && (
								<div className="absolute -bottom-4 w-12 h-1 bg-accent rounded-full shadow-[0_-4px_15px_rgba(255,77,0,0.6)] animate-in fade-in zoom-in duration-500" />
							)}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
