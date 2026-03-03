"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import AccessibleModal from "../shared/AccessibleModal";
import MaintenanceModal from "./MaintenanceModal";

interface Boat {
	id: string;
	nombre: string;
	tipo: string;
	capacidad: number;
	matricula: string;
	estado: string;
	notas: string;
	imagen_url: string;
	notion_threshold?: number;
}

interface BoatsTabProps {
	userRole: string;
}

export default function BoatsTab({ userRole }: BoatsTabProps) {
	const t = useTranslations("staff_panel");
	const isAdmin = userRole === "admin";
	const [boats, setBoats] = useState<Boat[]>([]);
	const [notionFleet, setNotionFleet] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingBoat, setEditingBoat] = useState<Boat | null>(null);
	const [managingMaintenance, setManagingMaintenance] = useState<Boat | null>(
		null,
	);
	const [saving, setSaving] = useState(false);
	const [showNotionIntelligence, setShowNotionIntelligence] = useState(true);

	// Form State
	const [formData, setFormData] = useState<Partial<Boat>>({
		nombre: "",
		tipo: "vela_ligera",
		capacidad: 1,
		matricula: "",
		estado: "disponible",
		notas: "",
		imagen_url: "",
		notion_threshold: 0.2,
	});

	const fetchBoats = async () => {
		setLoading(true);
		try {
			const [boatsRes, notionRes] = await Promise.all([
				fetch(apiUrl("/api/admin/boats/list")),
				fetch("/api/admin/notion/fleet"),
			]);

			const boatsData = await boatsRes.json();
			const notionData = await notionRes.json();

			if (boatsRes.ok) setBoats(boatsData.boats || []);
			if (notionRes.ok) setNotionFleet(notionData.fleet || []);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBoats();
	}, []);

	const handleCreate = () => {
		setEditingBoat(null);
		setFormData({
			nombre: "",
			tipo: "vela_ligera",
			capacidad: 1,
			matricula: "",
			estado: "disponible",
			notas: "",
			imagen_url: "",
		});
		setIsModalOpen(true);
	};

	const handleEdit = (boat: Boat) => {
		setEditingBoat(boat);
		setFormData({ ...boat });
		setIsModalOpen(true);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const endpoint = editingBoat
				? "/api/admin/boats/update"
				: "/api/admin/boats/create";

			const payload = editingBoat
				? { ...formData, id: editingBoat.id }
				: formData;

			const res = await fetch(apiUrl(endpoint), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (res.ok) {
				setIsModalOpen(false);
				fetchBoats(); // Refresh list
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error("Error saving boat:", error);
			alert(t("boats.save_error"));
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm(t("boats.delete_confirm"))) return;

		try {
			const res = await fetch(apiUrl("/api/admin/boats/delete"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (res.ok) {
				fetchBoats();
			} else {
				alert(t("boats.delete_error"));
			}
		} catch (error) {
			console.error("Error deleting:", error);
		}
	};

	// --- Filters & Sort State ---
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");
	const [sortOrder, setSortOrder] = useState("name_asc");

	// --- Derived Data ---
	const filteredBoats = React.useMemo(() => {
		let result = [...boats];

		// 1. Search (Name OR Matricula)
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase();
			result = result.filter(
				(b) =>
					b.nombre.toLowerCase().includes(q) ||
					(b.matricula && b.matricula.toLowerCase().includes(q)),
			);
		}

		// 2. Filter Status
		if (statusFilter !== "all") {
			result = result.filter((b) => b.estado === statusFilter);
		}

		// 3. Filter Type
		if (typeFilter !== "all") {
			result = result.filter((b) => b.tipo === typeFilter);
		}

		// 4. Sort
		result.sort((a, b) => {
			switch (sortOrder) {
				case "name_asc":
					return a.nombre.localeCompare(b.nombre);
				case "name_desc":
					return b.nombre.localeCompare(a.nombre);
				case "capacity_desc":
					return b.capacidad - a.capacidad;
				case "capacity_asc":
					return a.capacidad - b.capacidad;
				case "status":
					return a.estado.localeCompare(b.estado);
				default:
					return 0;
			}
		});

		return result;
	}, [boats, searchTerm, statusFilter, typeFilter, sortOrder]);

	if (loading) {
		return (
			<div className="p-8 text-white/50 animate-pulse">
				{t("boats.loading")}
			</div>
		);
	}

	const stats = {
		total: boats.length,
		available: boats.filter((b) => b.estado === "disponible").length,
		maintenance: boats.filter((b) => b.estado === "mantenimiento").length,
		broken: boats.filter((b) => b.estado === "averiado").length,
		operativity: Math.round(
			(boats.filter((b) => b.estado === "disponible").length /
				(boats.length || 1)) *
				100,
		),
	};

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Fleet Status Summary */}
			<div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
				<div className="bg-white/5 p-4 border border-white/5 rounded-sm">
					<span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">
						Flota Total
					</span>
					<span className="text-3xl font-display text-white italic">
						{stats.total}
					</span>
				</div>
				<div className="bg-white/5 p-4 border border-white/5 rounded-sm">
					<span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">
						Disponibles
					</span>
					<span className="text-3xl font-display text-green-500 italic">
						{stats.available}
					</span>
				</div>
				<div className="bg-white/5 p-4 border border-white/5 rounded-sm">
					<span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">
						Mantenimiento
					</span>
					<span className="text-3xl font-display text-yellow-500 italic">
						{stats.maintenance}
					</span>
				</div>
				<div className="bg-white/5 p-4 border border-white/5 rounded-sm">
					<span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">
						Averiados
					</span>
					<span className="text-3xl font-display text-red-500 italic">
						{stats.broken}
					</span>
				</div>
				<div className="bg-white/5 p-4 border border-white/5 rounded-sm col-span-2 lg:col-span-1 border-l-accent/20">
					<span className="text-[10px] uppercase tracking-widest text-accent block mb-1 italic">
						Operatividad
					</span>
					<div className="flex items-end gap-2">
						<span className="text-3xl font-display text-accent italic">
							{stats.operativity}%
						</span>
						<div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
							<div
								className="h-full bg-accent transition-all duration-1000"
								style={{ width: `${stats.operativity}%` }}
							></div>
						</div>
					</div>
				</div>
			</div>
			{/* Extended Header with Filters */}
			<header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/10 pb-8">
				<div className="space-y-2 min-w-fit">
					<span className="text-accent uppercase tracking-[0.4em] text-2xs font-bold block">
						Gestión de Flota
					</span>
					<h2 className="text-3xl md:text-5xl font-display text-white italic whitespace-nowrap">
						{t("boats.title")} ({filteredBoats.length})
					</h2>
				</div>

				<div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto">
					{/* Search */}
					<div className="relative flex-1 min-w-[240px] lg:flex-none">
						<input
							type="text"
							placeholder="Buscar por nombre o matrícula..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onFocus={(e) => e.target.select()}
							className="bg-white/5 border border-white/10 p-3 text-white text-sm outline-none focus:border-accent italic font-display w-full"
						/>
					</div>

					<div className="flex flex-wrap gap-4 w-full lg:w-auto">
						{/* Status Filter */}
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="bg-nautical-black border border-white/10 p-3 text-white text-[10px] outline-none focus:border-accent uppercase font-black tracking-widest flex-1 lg:flex-none"
						>
							<option value="all">Todo Estado</option>
							<option value="disponible">{t("boats.status.available")}</option>
							<option value="mantenimiento">
								{t("boats.status.maintenance")}
							</option>
							<option value="averiado">{t("boats.status.broken")}</option>
							<option value="en_uso">{t("boats.status.in_use")}</option>
						</select>

						{/* Type Filter */}
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="bg-nautical-black border border-white/10 p-3 text-white text-[10px] outline-none focus:border-accent uppercase font-black tracking-widest flex-1 lg:flex-none"
						>
							<option value="all">Todo Tipo</option>
							<option value="vela_ligera">
								{t("boats.types.sailing_light")}
							</option>
							<option value="crucero">{t("boats.types.cruiser")}</option>
							<option value="motor">{t("boats.types.motor")}</option>
							<option value="kayak">{t("boats.types.kayak")}</option>
							<option value="other">{t("boats.types.other")}</option>
						</select>

						{/* Sort */}
						<select
							value={sortOrder}
							onChange={(e) => setSortOrder(e.target.value)}
							className="bg-nautical-black border border-white/10 p-3 text-accent text-[10px] outline-none focus:border-accent uppercase font-black tracking-widest flex-1 lg:flex-none"
						>
							<option value="name_asc">A-Z Nombre</option>
							<option value="name_desc">Z-A Nombre</option>
							<option value="capacity_desc">Mayor Capacidad</option>
							<option value="capacity_asc">Menor Capacidad</option>
							<option value="status">Por Estado</option>
						</select>

						{isAdmin && (
							<button
								onClick={() =>
									setShowNotionIntelligence(!showNotionIntelligence)
								}
								className={`px-6 py-3 text-[10px] uppercase tracking-widest font-black transition-all shadow-lg whitespace-nowrap flex-1 lg:flex-none ${showNotionIntelligence ? "bg-sea-foam text-nautical-black" : "bg-white/5 text-white/40 border border-white/10"}`}
							>
								{showNotionIntelligence ? "💡 Intel ON" : "💡 Intel OFF"}
							</button>
						)}

						{isAdmin && (
							<button
								onClick={handleCreate}
								className="bg-accent text-nautical-black px-6 py-3 text-[10px] uppercase tracking-widest font-black hover:bg-white transition-all shadow-lg shadow-accent/20 whitespace-nowrap flex-1 lg:flex-none"
							>
								+ {t("boats.new_boat_btn")}
							</button>
						)}
					</div>
				</div>
			</header>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredBoats.map((boat) => (
					<div
						key={boat.id}
						className="p-6 bg-white/5 border border-white/5 rounded-sm relative group hover:border-accent/30 transition-all flex flex-col"
					>
						<div className="flex justify-between items-start mb-4">
							<span
								className={`px-2 py-1 text-2xs uppercase tracking-widest font-bold border ${
									boat.estado === "disponible"
										? "border-green-500 text-green-500"
										: boat.estado === "mantenimiento"
											? "border-yellow-500 text-yellow-500"
											: "border-red-500 text-red-500"
								}`}
							>
								{boat.estado === "disponible"
									? t("boats.status.available")
									: boat.estado === "mantenimiento"
										? t("boats.status.maintenance")
										: boat.estado === "averiado"
											? t("boats.status.broken")
											: t("boats.status.in_use")}
							</span>
							<div className="text-2xl opacity-50">
								{boat.tipo === "vela_ligera"
									? "⛵"
									: boat.tipo === "motor"
										? "🛥️"
										: "🛶"}
							</div>
						</div>

						<h3 className="text-xl font-display text-white mb-1">
							{boat.nombre}
						</h3>
						<p className="text-2xs text-white/40 font-mono mb-4">
							{boat.matricula || t("boats.matricula")}
						</p>

						{/* Notion Intelligence Widget */}
						{showNotionIntelligence && isAdmin && (
							<div className="mb-6 p-4 bg-accent/5 border border-accent/20 rounded-sm animate-premium-in">
								<div className="flex justify-between items-center mb-3">
									<span className="text-[9px] uppercase tracking-widest font-bold text-accent italic">
										Notion Intelligence
									</span>
									<a
										href={
											notionFleet.find((n) => n.supabase_id === boat.id)
												?.notion_url
										}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[10px] opacity-40 hover:opacity-100 transition-opacity"
									>
										↗️
									</a>
								</div>
								{(() => {
									const intel = notionFleet.find(
										(n) => n.supabase_id === boat.id,
									);
									if (!intel)
										return (
											<p className="text-[10px] text-white/20 italic">
												No vinculado en Notion
											</p>
										);
									return (
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-[11px] text-white/60">
													Alerta:
												</span>
												<span
													className={`text-[11px] font-bold ${intel.alerta.includes("🚨") ? "text-red-500 animate-pulse" : "text-green-500"}`}
												>
													{intel.alerta}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-[11px] text-white/60">
													ROI Proyectado:
												</span>
												<span
													className={`text-[11px] font-mono ${intel.roi > 0 ? "text-sea-foam" : "text-white/40"}`}
												>
													{intel.roi}%
												</span>
											</div>
											<div className="flex justify-between items-center bg-white/5 p-2 mt-2">
												<span className="text-[9px] text-white/40 uppercase">
													Ingresos: {intel.ingresos_reservas}€
												</span>
												<span className="text-[9px] text-white/40 uppercase">
													Gastos: {intel.gastos}€
												</span>
											</div>
										</div>
									);
								})()}
							</div>
						)}

						<div className="mt-auto space-y-4">
							<div className="flex justify-between text-2xs text-white/40 border-t border-white/5 pt-4">
								<span>
									{t("boats.capacity")}: {boat.capacidad} pax
								</span>
								<span className="uppercase">
									{boat.tipo === "vela_ligera"
										? t("boats.types.sailing_light")
										: boat.tipo === "crucero"
											? t("boats.types.cruiser")
											: boat.tipo === "motor"
												? t("boats.types.motor")
												: boat.tipo === "kayak"
													? t("boats.types.kayak")
													: t("boats.types.other")}
								</span>
							</div>

							<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => handleEdit(boat)}
									className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-2xs uppercase tracking-widest text-white transition-all"
								>
									{t("boats.edit_btn")}
								</button>
								<button
									onClick={() => setManagingMaintenance(boat)}
									className="flex-1 py-2 bg-accent/10 hover:bg-accent hover:text-nautical-black text-2xs uppercase tracking-widest text-accent transition-all font-bold"
								>
									{t("boats.maintenance_btn")}
								</button>
								{isAdmin && (
									<button
										onClick={() => handleDelete(boat.id)}
										className="px-3 py-2 border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all"
									>
										🗑️
									</button>
								)}
							</div>
						</div>
					</div>
				))}

				{filteredBoats.length === 0 && (
					<div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-sm text-white/20">
						{t("boats.no_boats")}
					</div>
				)}
			</div>

			<AccessibleModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={
					editingBoat ? t("boats.modal.edit_title") : t("boats.modal.new_title")
				}
				maxWidth="max-w-2xl"
			>
				<div className="space-y-8 py-4">
					<div className="grid grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-2xs uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
								{t("boats.modal.name_label")}
							</label>
							<input
								disabled={!isAdmin}
								className={`w-full bg-white/5 border border-white/10 p-4 text-white text-lg font-display italic outline-none focus:border-accent ${!isAdmin && "opacity-50 cursor-not-allowed"}`}
								value={formData.nombre}
								onChange={(e) =>
									setFormData({ ...formData, nombre: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-2xs uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
								{t("boats.modal.plate_label")}
							</label>
							<input
								disabled={!isAdmin}
								className={`w-full bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-accent font-mono ${!isAdmin && "opacity-50 cursor-not-allowed"}`}
								value={formData.matricula}
								onChange={(e) =>
									setFormData({ ...formData, matricula: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-6">
						<div className="space-y-2">
							<label className="text-2xs uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
								{t("boats.modal.type_label")}
							</label>
							<select
								disabled={!isAdmin}
								className={`w-full bg-nautical-deep border border-white/10 p-4 text-white outline-none focus:border-accent ${!isAdmin && "opacity-50 cursor-not-allowed"}`}
								value={formData.tipo}
								onChange={(e) =>
									setFormData({ ...formData, tipo: e.target.value })
								}
							>
								<option value="vela_ligera">
									{t("boats.types.sailing_light")}
								</option>
								<option value="crucero">{t("boats.types.cruiser")}</option>
								<option value="motor">{t("boats.types.motor")}</option>
								<option value="kayak">{t("boats.types.kayak")}</option>
								<option value="other">{t("boats.types.other")}</option>
							</select>
						</div>
						<div className="space-y-2">
							<label className="text-2xs uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
								{t("boats.modal.capacity_label")}
							</label>
							<input
								type="number"
								disabled={!isAdmin}
								className={`w-full bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-accent ${!isAdmin && "opacity-50 cursor-not-allowed"}`}
								value={formData.capacidad}
								onChange={(e) =>
									setFormData({
										...formData,
										capacidad: parseInt(e.target.value),
									})
								}
								onFocus={(e) => e.target.select()}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-2xs uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
								{t("boats.modal.status_label")}
							</label>
							<select
								className="w-full bg-nautical-deep border border-white/10 p-4 text-white outline-none focus:border-accent"
								value={formData.estado}
								onChange={(e) =>
									setFormData({ ...formData, estado: e.target.value })
								}
							>
								<option value="disponible" className="text-green-500">
									{t("boats.status.available")}
								</option>
								<option value="mantenimiento" className="text-yellow-500">
									{t("boats.status.maintenance")}
								</option>
								<option value="averiado" className="text-red-500">
									{t("boats.status.broken")}
								</option>
								<option value="en_uso" className="text-blue-500">
									{t("boats.status.in_use")}
								</option>
							</select>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-2xs uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
							{t("boats.modal.notes_label")}
						</label>
						<textarea
							rows={4}
							className="w-full bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-accent resize-none text-sm italic font-display"
							value={formData.notas}
							onChange={(e) =>
								setFormData({ ...formData, notas: e.target.value })
							}
							placeholder={t("boats.modal.notes_placeholder")}
						/>
					</div>

					<div className="bg-accent/5 p-6 rounded-sm border border-accent/20 space-y-4">
						<div className="flex justify-between items-center">
							<h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent italic">
								Notion Fleet Control
							</h4>
							<div className="text-[8px] bg-accent/20 px-2 py-1 text-accent font-black">
								AI AGENT
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-2xs uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
								Umbral ROI para Alerta (%)
							</label>
							<div className="flex items-center gap-4">
								<input
									type="number"
									step="0.05"
									min="0"
									max="1"
									disabled={!isAdmin}
									className={`flex-1 bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-accent ${!isAdmin && "opacity-50 cursor-not-allowed"}`}
									value={formData.notion_threshold || 0}
									onChange={(e) =>
										setFormData({
											...formData,
											notion_threshold: parseFloat(e.target.value),
										})
									}
								/>
								<span className="text-3xl font-display text-accent italic">
									{((formData.notion_threshold || 0) * 100).toFixed(0)}%
								</span>
							</div>
							<p className="text-[9px] text-white/30 uppercase leading-relaxed">
								Este valor se sincroniza con Notion para disparar alertas de
								baja rentabilidad o necesidad de mantenimiento proactivo.
							</p>
						</div>
					</div>

					<div className="flex gap-4 pt-4">
						<button
							onClick={() => setIsModalOpen(false)}
							className="flex-1 py-5 border border-white/10 text-2xs uppercase tracking-widest text-white/40 hover:text-white transition-all font-bold"
						>
							{t("boats.modal.cancel_btn")}
						</button>
						<button
							onClick={handleSave}
							disabled={saving}
							className="flex-1 py-5 bg-accent text-nautical-black text-2xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
						>
							{saving ? t("boats.modal.saving_btn") : t("boats.modal.save_btn")}
						</button>
					</div>
				</div>
			</AccessibleModal>

			{managingMaintenance && (
				<MaintenanceModal
					boat={managingMaintenance}
					onClose={() => setManagingMaintenance(null)}
				/>
			)}
		</div>
	);
}
