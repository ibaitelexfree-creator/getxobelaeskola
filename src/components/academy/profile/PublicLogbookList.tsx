import { Anchor, Calendar, Clock, MapPin } from "lucide-react";

interface PublicLogbookListProps {
	logbook: any[];
}

export default function PublicLogbookList({ logbook }: PublicLogbookListProps) {
	if (!logbook || logbook.length === 0) return null;

	return (
		<section className="mb-12">
			<h2 className="text-2xl font-display italic text-white mb-6 flex items-center gap-3">
				<span className="text-accent">▶</span> Bitácora de Salidas
			</h2>
			<div className="space-y-4">
				{logbook.map((entry: any) => (
					<div
						key={entry.id}
						className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.07] transition-colors"
					>
						<div className="flex items-center gap-6">
							<div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
								<Anchor size={24} />
							</div>
							<div>
								<h3 className="font-bold text-white text-lg mb-1">
									{entry.tipo?.replace("_", " ").toUpperCase() || "NAVEGACIÓN"}
								</h3>
								<div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
									<span className="flex items-center gap-1.5">
										<Calendar size={12} />{" "}
										{new Date(entry.fecha).toLocaleDateString()}
									</span>
									{entry.embarcacion && (
										<span className="hidden md:inline">•</span>
									)}
									{entry.embarcacion && (
										<span className="flex items-center gap-1.5">
											{entry.embarcacion}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3 bg-black/20 px-5 py-3 rounded-xl border border-white/5 self-start md:self-auto">
							<Clock size={16} className="text-accent" />
							<span className="font-bold text-white text-sm">
								{entry.duracion_h} h
							</span>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
