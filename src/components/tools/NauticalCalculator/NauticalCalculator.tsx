"use client";

import {
	ArrowRightLeft,
	Calculator,
	Clock,
	Compass,
	Map as MapIcon,
	RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	type Coordinate,
	calculateBearing,
	calculateDistance,
	calculateMagnetic,
	calculateTime,
	calculateTrue,
	type DMS,
	decimalToDms,
	dmsToDecimal,
	formatTime,
} from "@/lib/geospatial/nautical-calculator";

export default function NauticalCalculator() {
	const [activeTab, setActiveTab] = useState<
		"converter" | "route" | "time" | "compass"
	>("route");

	// --- Converter State ---
	const [dmsInput, setDmsInput] = useState<DMS>({
		degrees: 0,
		minutes: 0,
		seconds: 0,
		direction: "N",
	});
	const [decimalInput, setDecimalInput] = useState<number>(0);
	const [converterMode, setConverterMode] = useState<
		"dms-to-dec" | "dec-to-dms"
	>("dms-to-dec");
	const [converterResult, setConverterResult] = useState<string | null>(null);

	// --- Route State ---
	const [startPoint, setStartPoint] = useState<Coordinate>({
		lat: 43.35,
		lon: -3.05,
	}); // Bilbao aprox
	const [endPoint, setEndPoint] = useState<Coordinate>({
		lat: 43.4,
		lon: -2.95,
	});
	const [routeResult, setRouteResult] = useState<{
		distance: number;
		bearing: number;
	} | null>(null);

	// --- Time State ---
	const [timeDistance, setTimeDistance] = useState<number>(10);
	const [timeSpeed, setTimeSpeed] = useState<number>(5);
	const [timeResult, setTimeResult] = useState<string | null>(null);

	// --- Compass State ---
	const [compassHeading, setCompassHeading] = useState<number>(0);
	const [compassVariation, setCompassVariation] = useState<number>(0);
	const [compassMode, setCompassMode] = useState<"true-to-mag" | "mag-to-true">(
		"true-to-mag",
	);
	const [compassResult, setCompassResult] = useState<number | null>(null);

	// --- Effects ---
	useEffect(() => {
		// Auto-calculate Route
		if (startPoint && endPoint) {
			const dist = calculateDistance(startPoint, endPoint);
			const bear = calculateBearing(startPoint, endPoint);
			setRouteResult({ distance: dist, bearing: bear });
		}
	}, [startPoint, endPoint]);

	useEffect(() => {
		// Auto-calculate Time
		const t = calculateTime(timeDistance, timeSpeed);
		setTimeResult(formatTime(t));
	}, [timeDistance, timeSpeed]);

	useEffect(() => {
		// Auto-calculate Compass
		if (compassMode === "true-to-mag") {
			setCompassResult(calculateMagnetic(compassHeading, compassVariation));
		} else {
			setCompassResult(calculateTrue(compassHeading, compassVariation));
		}
	}, [compassHeading, compassVariation, compassMode]);

	useEffect(() => {
		// Auto-calculate Converter
		if (converterMode === "dms-to-dec") {
			setConverterResult(dmsToDecimal(dmsInput).toString());
		} else {
			const dms = decimalToDms(decimalInput, true); // Assuming Lat for generic display, user knows context
			setConverterResult(
				`${dms.degrees}° ${dms.minutes}' ${dms.seconds}" ${decimalInput >= 0 ? "+" : "-"}`,
			);
		}
	}, [dmsInput, decimalInput, converterMode]);

	// --- Handlers ---
	const handleDmsChange = (field: keyof DMS, value: string | number) => {
		setDmsInput((prev) => ({ ...prev, [field]: value }));
	};

	const tabs = [
		{ id: "route", label: "Rumbo y Distancia", icon: MapIcon },
		{ id: "time", label: "Tiempo Estimado", icon: Clock },
		{ id: "compass", label: "Corrección Rumbo", icon: Compass },
		{ id: "converter", label: "Conversor Coordenadas", icon: ArrowRightLeft },
	] as const;

	return (
		<div className="w-full max-w-4xl mx-auto bg-nautical-deep/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl text-sea-foam">
			{/* Header Tabs */}
			<div className="flex flex-wrap border-b border-white/10">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`flex items-center gap-2 px-6 py-4 transition-all duration-300 flex-1 justify-center text-sm uppercase tracking-wider font-bold
              ${
								activeTab === tab.id
									? "bg-accent/10 text-accent border-b-2 border-accent"
									: "text-white/40 hover:text-white hover:bg-white/5"
							}`}
					>
						<tab.icon size={18} />
						<span className="hidden sm:inline">{tab.label}</span>
					</button>
				))}
			</div>

			{/* Content Area */}
			<div className="p-6 min-h-[400px]">
				{/* --- Route Calculator --- */}
				{activeTab === "route" && (
					<div className="space-y-8 animate-fade-in">
						<div className="grid md:grid-cols-2 gap-8">
							{/* Point A */}
							<div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/5">
								<h3 className="text-accent font-bold uppercase tracking-widest text-xs flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-accent"></div>
									Punto de Origen (A)
								</h3>
								<div className="space-y-4">
									<div>
										<label className="text-xs uppercase text-white/50 block mb-1">
											Latitud (Decimal)
										</label>
										<input
											type="number"
											value={startPoint.lat}
											onChange={(e) =>
												setStartPoint({
													...startPoint,
													lat: parseFloat(e.target.value) || 0,
												})
											}
											className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sea-foam focus:border-accent outline-none transition-colors"
										/>
									</div>
									<div>
										<label className="text-xs uppercase text-white/50 block mb-1">
											Longitud (Decimal)
										</label>
										<input
											type="number"
											value={startPoint.lon}
											onChange={(e) =>
												setStartPoint({
													...startPoint,
													lon: parseFloat(e.target.value) || 0,
												})
											}
											className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sea-foam focus:border-accent outline-none transition-colors"
										/>
									</div>
								</div>
							</div>

							{/* Point B */}
							<div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/5">
								<h3 className="text-sea-foam font-bold uppercase tracking-widest text-xs flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-sea-foam"></div>
									Punto de Destino (B)
								</h3>
								<div className="space-y-4">
									<div>
										<label className="text-xs uppercase text-white/50 block mb-1">
											Latitud (Decimal)
										</label>
										<input
											type="number"
											value={endPoint.lat}
											onChange={(e) =>
												setEndPoint({
													...endPoint,
													lat: parseFloat(e.target.value) || 0,
												})
											}
											className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sea-foam focus:border-accent outline-none transition-colors"
										/>
									</div>
									<div>
										<label className="text-xs uppercase text-white/50 block mb-1">
											Longitud (Decimal)
										</label>
										<input
											type="number"
											value={endPoint.lon}
											onChange={(e) =>
												setEndPoint({
													...endPoint,
													lon: parseFloat(e.target.value) || 0,
												})
											}
											className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sea-foam focus:border-accent outline-none transition-colors"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Results */}
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-accent/10 border border-accent/20 p-6 rounded-lg text-center">
								<p className="text-xs uppercase tracking-widest text-accent mb-2">
									Distancia
								</p>
								<p className="text-4xl font-display font-bold text-white">
									{routeResult?.distance}{" "}
									<span className="text-lg text-white/40 font-sans">NM</span>
								</p>
							</div>
							<div className="bg-white/5 border border-white/10 p-6 rounded-lg text-center">
								<p className="text-xs uppercase tracking-widest text-sea-foam mb-2">
									Rumbo Inicial
								</p>
								<p className="text-4xl font-display font-bold text-white">
									{routeResult?.bearing}°
								</p>
							</div>
						</div>
					</div>
				)}

				{/* --- Time Calculator --- */}
				{activeTab === "time" && (
					<div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<label className="text-xs uppercase text-white/50 block mb-1">
									Distancia (Millas)
								</label>
								<input
									type="number"
									value={timeDistance}
									onChange={(e) =>
										setTimeDistance(parseFloat(e.target.value) || 0)
									}
									className="w-full bg-black/20 border border-white/10 rounded p-4 text-xl text-sea-foam focus:border-accent outline-none transition-colors"
								/>
							</div>
							<div className="space-y-4">
								<label className="text-xs uppercase text-white/50 block mb-1">
									Velocidad (Nudos)
								</label>
								<input
									type="number"
									value={timeSpeed}
									onChange={(e) =>
										setTimeSpeed(parseFloat(e.target.value) || 0)
									}
									className="w-full bg-black/20 border border-white/10 rounded p-4 text-xl text-sea-foam focus:border-accent outline-none transition-colors"
								/>
							</div>
						</div>

						<div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center mt-8">
							<p className="text-xs uppercase tracking-widest text-sea-foam mb-2">
								Tiempo Estimado
							</p>
							<p className="text-5xl font-display font-bold text-accent">
								{timeResult}
							</p>
						</div>
					</div>
				)}

				{/* --- Compass Calculator --- */}
				{activeTab === "compass" && (
					<div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
						<div className="flex justify-center gap-4 mb-6">
							<button
								onClick={() => setCompassMode("true-to-mag")}
								className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-bold border transition-colors ${compassMode === "true-to-mag" ? "bg-accent text-white border-accent" : "border-white/20 text-white/40 hover:text-white"}`}
							>
								Verdadero → Magnético
							</button>
							<button
								onClick={() => setCompassMode("mag-to-true")}
								className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-bold border transition-colors ${compassMode === "mag-to-true" ? "bg-accent text-white border-accent" : "border-white/20 text-white/40 hover:text-white"}`}
							>
								Magnético → Verdadero
							</button>
						</div>

						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<label className="text-xs uppercase text-white/50 block mb-1">
									{compassMode === "true-to-mag"
										? "Rumbo Verdadero (Rv)"
										: "Rumbo Magnético (Rm)"}
								</label>
								<input
									type="number"
									value={compassHeading}
									onChange={(e) =>
										setCompassHeading(parseFloat(e.target.value) || 0)
									}
									className="w-full bg-black/20 border border-white/10 rounded p-4 text-xl text-sea-foam focus:border-accent outline-none transition-colors"
								/>
							</div>
							<div className="space-y-4">
								<label className="text-xs uppercase text-white/50 block mb-1">
									Declinación Magnética (dm)
									<span className="block text-[10px] text-white/30 normal-case mt-1">
										Positivo (+) Este / Negativo (-) Oeste
									</span>
								</label>
								<input
									type="number"
									value={compassVariation}
									onChange={(e) =>
										setCompassVariation(parseFloat(e.target.value) || 0)
									}
									className="w-full bg-black/20 border border-white/10 rounded p-4 text-xl text-sea-foam focus:border-accent outline-none transition-colors"
								/>
							</div>
						</div>

						<div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center mt-8 relative overflow-hidden">
							<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
							<p className="text-xs uppercase tracking-widest text-sea-foam mb-2">
								{compassMode === "true-to-mag"
									? "Rumbo Magnético (Rm)"
									: "Rumbo Verdadero (Rv)"}
							</p>
							<p className="text-5xl font-display font-bold text-white">
								{compassResult}°
							</p>
						</div>
					</div>
				)}

				{/* --- Converter --- */}
				{activeTab === "converter" && (
					<div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
						<div className="flex justify-center gap-4 mb-6">
							<button
								onClick={() => setConverterMode("dms-to-dec")}
								className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-bold border transition-colors ${converterMode === "dms-to-dec" ? "bg-accent text-white border-accent" : "border-white/20 text-white/40 hover:text-white"}`}
							>
								GMS → Decimal
							</button>
							<button
								onClick={() => setConverterMode("dec-to-dms")}
								className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-bold border transition-colors ${converterMode === "dec-to-dms" ? "bg-accent text-white border-accent" : "border-white/20 text-white/40 hover:text-white"}`}
							>
								Decimal → GMS
							</button>
						</div>

						{converterMode === "dms-to-dec" ? (
							<div className="grid grid-cols-4 gap-4">
								<div className="col-span-1">
									<label className="text-xs uppercase text-white/50 block mb-1">
										Grados
									</label>
									<input
										type="number"
										value={dmsInput.degrees}
										onChange={(e) =>
											handleDmsChange(
												"degrees",
												parseFloat(e.target.value) || 0,
											)
										}
										className="w-full bg-black/20 border border-white/10 rounded p-2 text-center"
									/>
								</div>
								<div className="col-span-1">
									<label className="text-xs uppercase text-white/50 block mb-1">
										Minutos
									</label>
									<input
										type="number"
										value={dmsInput.minutes}
										onChange={(e) =>
											handleDmsChange(
												"minutes",
												parseFloat(e.target.value) || 0,
											)
										}
										className="w-full bg-black/20 border border-white/10 rounded p-2 text-center"
									/>
								</div>
								<div className="col-span-1">
									<label className="text-xs uppercase text-white/50 block mb-1">
										Segundos
									</label>
									<input
										type="number"
										value={dmsInput.seconds}
										onChange={(e) =>
											handleDmsChange(
												"seconds",
												parseFloat(e.target.value) || 0,
											)
										}
										className="w-full bg-black/20 border border-white/10 rounded p-2 text-center"
									/>
								</div>
								<div className="col-span-1">
									<label className="text-xs uppercase text-white/50 block mb-1">
										Dir
									</label>
									<select
										value={dmsInput.direction}
										onChange={(e) =>
											handleDmsChange("direction", e.target.value)
										}
										className="w-full bg-black/20 border border-white/10 rounded p-2 text-center text-sea-foam"
									>
										<option value="N">N</option>
										<option value="S">S</option>
										<option value="E">E</option>
										<option value="W">W</option>
									</select>
								</div>
							</div>
						) : (
							<div>
								<label className="text-xs uppercase text-white/50 block mb-1">
									Coordenada Decimal
								</label>
								<input
									type="number"
									value={decimalInput}
									onChange={(e) =>
										setDecimalInput(parseFloat(e.target.value) || 0)
									}
									className="w-full bg-black/20 border border-white/10 rounded p-4 text-xl text-sea-foam focus:border-accent outline-none transition-colors"
								/>
							</div>
						)}

						<div className="bg-white/5 border border-white/10 p-6 rounded-lg text-center mt-6">
							<p className="text-xs uppercase tracking-widest text-sea-foam mb-2">
								Resultado
							</p>
							<p className="text-3xl font-display font-bold text-white">
								{converterResult}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
