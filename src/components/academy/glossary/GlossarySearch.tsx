"use client";

import Fuse from "fuse.js";
import { Anchor, BookOpen, ExternalLink, Search, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import {
	GLOSSARY_TERMS,
	type GlossaryCategory,
	type GlossaryTerm,
} from "@/data/glossary";

const CATEGORIES: GlossaryCategory[] = [
	"Maniobras",
	"Partes del barco",
	"Meteorología",
	"Reglamento",
];

const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
	Maniobras:
		"bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
	"Partes del barco":
		"bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
	Meteorología:
		"bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20",
	Reglamento:
		"bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
};

interface GlossarySearchProps {
	locale: string;
}

export default function GlossarySearch({ locale }: GlossarySearchProps) {
	const t = useTranslations("glossary");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<GlossaryCategory | null>(null);

	const fuse = useMemo(() => {
		return new Fuse(GLOSSARY_TERMS, {
			keys: ["term", "definition"],
			threshold: 0.3,
			includeScore: true,
		});
	}, []);

	const results = useMemo(() => {
		let filtered: GlossaryTerm[];

		if (searchTerm) {
			filtered = fuse.search(searchTerm).map((result) => result.item);
		} else {
			filtered = [...GLOSSARY_TERMS]; // Copy to avoid mutation
		}

		if (selectedCategory) {
			filtered = filtered.filter((item) => item.category === selectedCategory);
		}

		// Sort alphabetically if not searching (search results are ranked by relevance)
		if (!searchTerm) {
			filtered.sort((a, b) => a.term.localeCompare(b.term));
		}

		return filtered;
	}, [searchTerm, selectedCategory, fuse]);

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedCategory(null);
	};

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Search and Filter Section */}
			<div className="space-y-6">
				{/* Search Input */}
				<div className="relative max-w-2xl mx-auto">
					<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
						<Search className="h-5 w-5 text-white/40" />
					</div>
					<input
						type="text"
						className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
						placeholder={t("search_placeholder")}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					)}
				</div>

				{/* Category Pills */}
				<div className="flex flex-wrap justify-center gap-3">
					<button
						onClick={() => setSelectedCategory(null)}
						className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
							selectedCategory === null
								? "bg-accent text-nautical-black border-accent"
								: "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/20"
						}`}
					>
						{t("all")}
					</button>
					{CATEGORIES.map((category) => (
						<button
							key={category}
							onClick={() =>
								setSelectedCategory(
									category === selectedCategory ? null : category,
								)
							}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
								selectedCategory === category
									? CATEGORY_COLORS[category]
											.replace("bg-", "bg-opacity-100 bg-")
											.replace("text-", "text-nautical-black text-")
											.replace("border-", "border-transparent border-")
									: "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/20"
							} ${selectedCategory === category ? "!bg-white !text-nautical-black !border-white" : ""}`}
						>
							{category}
						</button>
					))}
				</div>
			</div>

			{/* Results Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{results.length > 0 ? (
					results.map((item) => (
						<div
							key={item.id}
							className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-accent/30 transition-all duration-300"
						>
							<div className="flex items-start justify-between mb-4">
								<span
									className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${CATEGORY_COLORS[item.category]}`}
								>
									{item.category}
								</span>
								<BookOpen className="h-4 w-4 text-white/20 group-hover:text-accent transition-colors" />
							</div>

							<h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-accent transition-colors">
								{item.term}
							</h3>

							<p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow">
								{item.definition}
							</p>

							{item.moduleId && (
								<Link
									href={`/${locale}/academy/module/${item.moduleId}`}
									className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent/80 hover:text-accent transition-colors mt-auto"
								>
									<ExternalLink className="h-3 w-3" />
									{t("view_in_module")}
								</Link>
							)}
						</div>
					))
				) : (
					<div className="col-span-full py-20 text-center">
						<div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
							<Anchor className="h-8 w-8" />
						</div>
						<h3 className="text-xl font-display text-white mb-2">
							{t("no_results")}
						</h3>
						<p className="text-white/50 mb-6">{t("no_results_desc")}</p>
						<button
							onClick={clearFilters}
							className="px-6 py-2 bg-accent text-nautical-black text-xs font-black uppercase tracking-widest rounded-sm hover:bg-white transition-colors"
						>
							{t("clear_filters")}
						</button>
					</div>
				)}
			</div>

			<div className="text-center pt-8 border-t border-white/5 mt-12">
				<p className="text-white/30 text-xs">
					{t("showing_results", {
						count: results.length,
						total: GLOSSARY_TERMS.length,
					})}
				</p>
			</div>
		</div>
	);
}
