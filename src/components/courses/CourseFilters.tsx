"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Category {
	id: string;
	nombre_es: string;
	nombre_eu: string;
	slug: string;
}

interface CourseFiltersProps {
	categories: Category[];
	locale: string;
}

export default function CourseFilters({
	categories,
	locale,
}: CourseFiltersProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeCategory = searchParams.get("category");

	const handleCategoryChange = (id: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (id) {
			params.set("category", id);
		} else {
			params.delete("category");
		}
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<div
			className="relative mb-20 animate-fade-in"
			style={{ animationDelay: "0.8s" }}
		>
			{/* Gradient Mask for horizontal scroll */}
			<div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-nautical-deep to-transparent z-10 pointer-events-none" />

			<div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar scroll-smooth">
				<button
					onClick={() => handleCategoryChange(null)}
					className={`whitespace-nowrap px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border ${
						!activeCategory
							? "bg-accent text-nautical-black border-accent shadow-[0_0_25px_rgba(255,77,0,0.25)]"
							: "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
					}`}
				>
					{locale === "eu" ? "Guztiak" : locale === "en" ? "All" : "Todos"}
				</button>
				{categories.map((cat) => (
					<button
						key={cat.id}
						onClick={() => handleCategoryChange(cat.id)}
						className={`whitespace-nowrap px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border ${
							activeCategory === cat.id
								? "bg-accent text-nautical-black border-accent shadow-[0_0_25px_rgba(255,77,0,0.25)]"
								: "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
						}`}
					>
						{locale === "eu" ? cat.nombre_eu : cat.nombre_es}
					</button>
				))}
			</div>

			{/* Hint for mobile scrolling */}
			<div className="mt-4 flex items-center gap-3 opacity-20">
				<div className="h-px w-8 bg-white" />
				<span className="text-[9px] uppercase tracking-[0.4em] text-white">
					Slide to filter
				</span>
			</div>
		</div>
	);
}
