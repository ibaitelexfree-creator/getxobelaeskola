import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";

interface SearchResult {
	id: string;
	_table: string;
	_title: string;
	_relations: { label: string; count: number; table: string }[];
	[key: string]: any;
}

export default function DataExplorerTab() {
	const [query, setQuery] = useState("");
	const [selectedTable, setSelectedTable] = useState("all");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleSearch = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!query.trim()) return;

		setIsLoading(true);
		setResults([]);
		try {
			const res = await fetch(
				`/api/admin/explorer?q=${encodeURIComponent(query)}&table=${selectedTable}`,
			);
			const data = await res.json();
			setResults(data.results || []);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const TABLES = [
		{ id: "all", label: "Todo el Ecosistema" },
		{ id: "profiles", label: "Usuarios (Perfiles)" },
		{ id: "cursos", label: "Cursos" },
		{ id: "reservas_alquiler", label: "Reservas Alquiler" },
		{ id: "embarcaciones", label: "Flota" },
		{ id: "mensajes_contacto", label: "CRM Mensajes" },
		{ id: "newsletter_subscriptions", label: "Newsletter" },
	];

	return (
		<div className="space-y-8 animate-in fade-in duration-700 min-h-[600px]">
			{/* Header Area */}
			<div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<span className="w-8 h-[1px] bg-indigo-400/50" />
						<span className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-400/60">
							Data Intelligence
						</span>
					</div>
					<h2 className="text-4xl font-display text-white italic tracking-tight">
						Explorador de{" "}
						<span className="text-indigo-400 underline underline-offset-8 decoration-indigo-400/20">
							Datos
						</span>
					</h2>
					<p className="text-white/40 text-sm max-w-md">
						Busca en toda la base de datos y visualiza conexiones entre
						entidades.
					</p>
				</div>
			</div>

			{/* Search Bar */}
			<form
				onSubmit={handleSearch}
				className="flex gap-4 p-1 bg-white/5 border border-white/10 rounded-full max-w-3xl"
			>
				<select
					value={selectedTable}
					onChange={(e) => setSelectedTable(e.target.value)}
					className="bg-transparent text-white/60 text-xs uppercase font-bold px-6 py-3 outline-none border-r border-white/10 cursor-pointer hover:text-white transition-colors appearance-none"
					style={{ backgroundImage: "none" }}
				>
					{TABLES.map((t) => (
						<option
							key={t.id}
							value={t.id}
							className="bg-nautical-black text-white"
						>
							{t.label}
						</option>
					))}
				</select>

				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Escribe ID, nombre, email o referencia..."
					className="flex-1 bg-transparent text-white placeholder-white/20 text-lg font-display outline-none px-4"
				/>

				<button
					type="submit"
					disabled={isLoading}
					className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-wait font-bold uppercase tracking-wider text-xs"
				>
					{isLoading ? "Buscando..." : "Buscar"}
				</button>
			</form>

			{/* Results Grid */}
			<div className="grid grid-cols-1 gap-4">
				{results.length > 0
					? results.map((result, idx) => (
							<div
								key={`${result.id}-${idx}`}
								className="bg-nautical-black/50 border border-white/5 rounded-sm overflow-hidden hover:border-indigo-500/30 transition-all group"
							>
								<div
									className="p-6 flex justify-between items-start cursor-pointer"
									onClick={() =>
										setExpandedId(expandedId === result.id ? null : result.id)
									}
								>
									<div className="space-y-1">
										<div className="flex items-center gap-3">
											<span className="text-[10px] uppercase font-black tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-sm">
												{TABLES.find((t) => t.id === result._table)?.label ||
													result._table}
											</span>
											<span className="text-[10px] font-mono text-white/20">
												#{result.id.slice(0, 8)}...
											</span>
										</div>
										<h4 className="text-xl font-display text-white group-hover:text-indigo-400 transition-colors">
											{result._title}
										</h4>

										{/* Connection Pills */}
										<div className="flex gap-2 mt-2">
											{result._relations.map((rel, i) => (
												<span
													key={i}
													className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
												>
													🔗 {rel.count} {rel.label}
												</span>
											))}
										</div>
									</div>
									<div className="text-white/20 group-hover:text-white transition-colors">
										{expandedId === result.id ? "➖" : "➕"}
									</div>
								</div>

								{/* Expanded Details (JSON View) */}
								{expandedId === result.id && (
									<div className="bg-black/40 p-6 border-t border-white/5 font-mono text-xs text-green-400 overflow-x-auto">
										<pre>
											{JSON.stringify(
												result,
												(key, value) => {
													if (key.startsWith("_")) return undefined; // Hide internal fields
													return value;
												},
												2,
											)}
										</pre>
									</div>
								)}
							</div>
						))
					: !isLoading &&
						query && (
							<div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
								<p className="text-white/20 italic font-display text-xl">
									No se encontraron resultados para "{query}"
								</p>
							</div>
						)}

				{!query && !isLoading && (
					<div className="py-20 text-center">
						<div className="text-6xl mb-4 opacity-10">🔍</div>
						<p className="text-white/20 font-display text-lg">
							Selecciona una tabla y busca para explorar el ecosistema.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
