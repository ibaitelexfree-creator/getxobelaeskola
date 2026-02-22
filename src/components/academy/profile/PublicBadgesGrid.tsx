import { Award } from "lucide-react";

interface PublicBadgesGridProps {
	badges: any[];
}

export default function PublicBadgesGrid({ badges }: PublicBadgesGridProps) {
	if (!badges || badges.length === 0) return null;

	return (
		<section className="mb-12">
			<h2 className="text-2xl font-display italic text-white mb-6 flex items-center gap-3">
				<span className="text-accent">▶</span> Logros y Medallas
			</h2>
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{badges.map((badgeItem: any) => {
					const badge = badgeItem.logro;
					return (
						<div
							key={badge.id}
							className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
						>
							<div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
								{badge.icono || "🏆"}
							</div>
							<h3 className="text-xs font-bold text-white mb-2 line-clamp-1">
								{badge.nombre_es}
							</h3>
							<p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">
								{badge.descripcion_es}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
