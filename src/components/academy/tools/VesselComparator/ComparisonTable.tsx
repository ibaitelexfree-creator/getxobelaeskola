"use client";

import { Sailboat } from "lucide-react";
import { type Vessel, vessels } from "@/data/vessels";

interface ComparisonTableProps {
	selectedIds: string[];
}

export default function ComparisonTable({ selectedIds }: ComparisonTableProps) {
	const selectedVessels = vessels.filter((v) => selectedIds.includes(v.id));

	// Sort based on selection order
	const sortedVessels = selectedVessels.sort((a, b) => {
		return selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id);
	});

	if (sortedVessels.length === 0) return null;

	const features: Array<{
		label: string;
		key: keyof Vessel["specs"];
		unit: string;
	}> = [
		{ label: "Eslora", key: "length", unit: "m" },
		{ label: "Manga", key: "beam", unit: "m" },
		{ label: "Desplazamiento", key: "displacement", unit: "kg" },
		{ label: "Sup. Vélica", key: "sailArea", unit: "m²" },
		{ label: "Precio Est.", key: "price", unit: "" },
		{ label: "Nivel", key: "level", unit: "" },
	];

	return (
		<div className="w-full overflow-x-auto custom-scrollbar pb-4">
			<table className="w-full min-w-[600px] border-collapse text-sm">
				<thead>
					<tr>
						<th className="text-left p-4 text-white/40 font-normal uppercase tracking-widest text-xs border-b border-white/10 w-40 sticky left-0 bg-[#000510] z-10">
							Especificación
						</th>
						{sortedVessels.map((v) => (
							<th
								key={v.id}
								className="text-left p-4 text-accent font-display italic text-lg border-b border-white/10 min-w-[180px]"
							>
								{v.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{/* Image Row Placeholder */}
					<tr>
						<td className="p-4 border-b border-white/5 sticky left-0 bg-[#000510] z-10"></td>
						{sortedVessels.map((v) => (
							<td key={v.id} className="p-4 border-b border-white/5">
								<div className="w-full aspect-video bg-white/5 rounded-md flex items-center justify-center text-white/20 border border-white/10">
									<Sailboat size={32} strokeWidth={1} />
								</div>
							</td>
						))}
					</tr>

					{features.map((feature, idx) => (
						<tr
							key={feature.key}
							className={idx % 2 === 0 ? "bg-white/[0.02]" : ""}
						>
							<td className="p-4 font-bold text-white/80 border-b border-white/5 sticky left-0 bg-[#000510] z-10">
								{feature.label}
							</td>
							{sortedVessels.map((v) => (
								<td
									key={v.id}
									className="p-4 text-white/90 border-b border-white/5 font-mono"
								>
									{v.specs[feature.key]}
									{feature.unit && (
										<span className="text-white/40 ml-1 text-xs">
											{feature.unit}
										</span>
									)}
								</td>
							))}
						</tr>
					))}

					{/* Description Row */}
					<tr>
						<td className="p-4 font-bold text-white/80 border-b border-white/5 align-top pt-6 sticky left-0 bg-[#000510] z-10">
							Descripción
						</td>
						{sortedVessels.map((v) => (
							<td
								key={v.id}
								className="p-4 text-white/60 text-xs leading-relaxed border-b border-white/5 align-top pt-6"
							>
								{v.description}
							</td>
						))}
					</tr>
				</tbody>
			</table>
		</div>
	);
}
