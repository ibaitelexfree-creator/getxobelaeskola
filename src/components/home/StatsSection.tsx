import Image from "next/image";
import React from "react";

interface StatsSectionProps {
	pasionLabel: string;
	alumnosLabel: string;
	flotaLabel: string;
	clasesLabel: string;
}

export default function StatsSection({
	pasionLabel,
	alumnosLabel,
	flotaLabel,
	clasesLabel,
}: StatsSectionProps) {
	const stats = [
		{ label: pasionLabel, value: "30+" },
		{ label: alumnosLabel, value: "5K+" },
		{ label: flotaLabel, value: "12" },
		{ label: clasesLabel, value: "100%" },
	];
	return (
		<section className="relative py-32 bg-nautical-black overflow-hidden group">
			<div
				className="absolute inset-0 z-0 opacity-10 bg-waves"
				aria-hidden="true"
			/>
			<div
				className="absolute inset-0 bg-gradient-to-b from-nautical-black via-transparent to-nautical-black"
				aria-hidden="true"
			/>

			<div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/2" />

			<div className="container mx-auto px-6 relative z-10">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
					{stats.map((stat, index) => (
						<div key={index} className="text-center group">
							<h3 className="text-5xl lg:text-7xl font-display text-white mb-4 group-hover:text-accent transition-colors duration-500">
								{stat.value}
							</h3>
							<div className="w-12 h-px bg-brass-gold mx-auto mb-4 group-hover:scale-x-150 transition-transform duration-500 origin-center" />
							<h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">
								{stat.label}
							</h4>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
