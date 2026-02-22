"use client";
import { useTranslations } from "next-intl";
import React from "react";

interface Rental {
	id: string;
	hora_inicio: string;
	estado_entrega: string;
	profiles?: {
		nombre: string;
		apellidos?: string;
	};
	servicios_alquiler?: {
		nombre_es: string;
	};
	[key: string]: unknown;
}

interface RentalsTabProps {
	filteredRentals: Rental[];
	rentalSearch: string;
	setRentalSearch: (v: string) => void;
	rentalStatusFilter: string;
	setRentalStatusFilter: (v: string) => void;
	rentalSort: string;
	setRentalSort: (v: string) => void;
	setViewingHistory: (v: Rental) => void;
	setUpdatingStatus: (v: { id: string; nextStatus: string }) => void;
	totalPages: number;
	currentPage: number;
	onPageChange: (page: number) => void;
	loading: boolean;
}

export default function RentalsTab({
	filteredRentals,
	rentalSearch,
	setRentalSearch,
	rentalStatusFilter,
	setRentalStatusFilter,
	rentalSort,
	setRentalSort,
	setViewingHistory,
	setUpdatingStatus,
	totalPages,
	currentPage,
	onPageChange,
	loading,
}: RentalsTabProps) {
	const t = useTranslations("staff_panel");

	return (
		<div className="space-y-12 animate-premium-in">
			<header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8 md:pb-12">
				<div className="space-y-2">
					<span className="text-accent uppercase tracking-[0.4em] text-2xs font-bold block">
						{t("rentals.fleet_scan")}
					</span>
					<h2 className="text-4xl md:text-6xl font-display text-white italic">
						{t("rentals.title")}
					</h2>
				</div>
				<div className="flex flex-col md:flex-row gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
					<input
						type="text"
						placeholder={t("rentals.search_placeholder")}
						value={rentalSearch}
						onChange={(e) => setRentalSearch(e.target.value)}
						onFocus={(e) => e.target.select()}
						className="bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-accent italic font-display w-full md:w-64"
					/>
					<select
						value={rentalStatusFilter}
						onChange={(e) => setRentalStatusFilter(e.target.value)}
						className="bg-nautical-black border border-white/10 p-4 text-white text-2xs outline-none focus:border-accent uppercase font-black tracking-widest w-full md:w-auto"
					>
						<option value="all">{t("rentals.status_filter.all")}</option>
						<option value="pendiente">
							{t("rentals.status_filter.pending")}
						</option>
						<option value="entregado">
							{t("rentals.status_filter.in_water")}
						</option>
						<option value="devuelto">
							{t("rentals.status_filter.finished")}
						</option>
					</select>
					<select
						value={rentalSort}
						onChange={(e) => setRentalSort(e.target.value)}
						className="bg-nautical-black border border-white/10 p-4 text-accent text-2xs outline-none focus:border-accent uppercase font-black tracking-widest w-full md:w-auto"
					>
						<option value="date_desc">📅 RECIENTES PRIMERO</option>
						<option value="date_asc">📅 ANTIGUOS PRIMERO</option>
						<option value="price_desc">💰 MAYOR PRECIO</option>
						<option value="price_asc">💰 MENOR PRECIO</option>
						<option value="recent">⚡ ÚLTIMOS CREADOS</option>
					</select>
				</div>
			</header>

			{loading ? (
				<div className="py-20 text-center animate-pulse">
					<div className="text-3xl font-display text-white/20 italic">
						Cargando flota...
					</div>
				</div>
			) : (
				<div className="grid gap-4">
					{filteredRentals.length > 0 ? (
						filteredRentals.map((r) => (
							<div
								key={r.id}
								className="glass-card p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 rounded-sm animate-premium-in"
							>
								<div className="text-center min-w-[110px] md:min-w-[150px] border-r border-white/5 pr-6 md:pr-10 shrink-0">
									<div className="flex items-center justify-center gap-1 -mb-1">
										<span className="text-2xl md:text-4xl font-display text-accent italic tracking-tighter">
											{typeof r.fecha_reserva === "string"
												? r.fecha_reserva.split("-")[2]
												: "--"}
										</span>
										<span className="text-lg md:text-xl font-display text-accent/30 italic">
											/
										</span>
										<span className="text-2xl md:text-4xl font-display text-accent italic tracking-tighter">
											{typeof r.fecha_reserva === "string"
												? r.fecha_reserva.split("-")[1]
												: "--"}
										</span>
										<span className="text-lg md:text-xl font-display text-accent/30 italic">
											/
										</span>
										<span className="text-2xl md:text-4xl font-display text-accent italic tracking-tighter">
											{typeof r.fecha_reserva === "string"
												? r.fecha_reserva.split("-")[0].slice(-2)
												: "--"}
										</span>
									</div>
									<span className="block text-technical opacity-40 text-3xs md:text-2xs tracking-[0.3em] mt-1 font-bold">
										{r.hora_inicio
											? r.hora_inicio.split(":").slice(0, 2).join(":")
											: "00:00"}
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="text-2xl md:text-3xl font-display text-white italic mb-1 truncate">
										{r.servicios_alquiler?.nombre_es}
									</h4>
									<p className="text-technical text-white/30 text-2xs md:text-base truncate">
										{r.profiles?.nombre} {r.profiles?.apellidos}
									</p>
								</div>
								<div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8 w-full md:w-auto">
									<button
										onClick={() => setViewingHistory(r)}
										className="p-2 text-technical text-white/20 hover:text-accent transition-all text-2xs md:text-base"
									>
										HISTORIAL ✍︎
									</button>
									<div className="flex flex-wrap gap-2 p-1.5 glass-panel rounded-xl md:rounded-full w-full md:w-auto justify-center">
										{["pendiente", "entregado", "devuelto"].map((st) => (
											<button
												key={st}
												onClick={() =>
													setUpdatingStatus({ id: r.id, nextStatus: st })
												}
												className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 text-3xs md:text-2xs uppercase tracking-[0.2em] font-black rounded-full transition-all duration-300 ${r.estado_entrega === st ? (st === "pendiente" ? "bg-white text-nautical-black" : st === "entregado" ? "bg-accent text-nautical-black" : "bg-green-500 text-white") : "text-white/20 hover:text-white/40"}`}
											>
												{st}
											</button>
										))}
									</div>
								</div>
							</div>
						))
					) : (
						<div className="p-20 text-center border border-dashed border-white/5 rounded-sm text-white/20 italic">
							No hay salidas que coincidan con los filtros.
						</div>
					)}
				</div>
			)}

			{/* Pagination Controls */}
			{!loading && totalPages > 1 && (
				<div className="flex justify-center gap-4 mt-8">
					<button
						onClick={() => onPageChange(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
						className="px-6 py-3 border border-white/10 text-2xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60 transition-all"
					>
						Anterior
					</button>
					<div className="flex items-center px-4 text-sm font-mono text-accent">
						PÁGINA {currentPage} / {totalPages}
					</div>
					<button
						onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
						className="px-6 py-3 border border-white/10 text-2xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60 transition-all"
					>
						Siguiente
					</button>
				</div>
			)}
		</div>
	);
}
