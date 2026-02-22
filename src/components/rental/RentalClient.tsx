"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { getInitialBookingDate, getSpainTimeInfo } from "@/lib/utils/date";
import LegalConsentModal from "../shared/LegalConsentModal";
import RentalCard from "./RentalCard";

interface RentalService {
	id: string;
	nombre_es: string;
	nombre_eu: string;
	categoria: string;
	slug: string;
	precio_base: number;
	opciones: { label: string; extra: number }[];
	imagen_url: string;
}

export default function RentalClient({
	services,
	locale,
}: {
	services: RentalService[];
	locale: string;
}) {
	const t = useTranslations("rental_page");
	const router = useRouter();
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [bookingService, setBookingService] = useState<string | null>(null);
	const [bookingOption, setBookingOption] = useState<number | null>(null);

	// Day, Month, Year states based on Spain time
	const [spainNow] = useState(() => getSpainTimeInfo());
	const currentYear = spainNow.year;

	const initialDate = useMemo(
		() => getInitialBookingDate(spainNow),
		[spainNow],
	);

	const [day, setDay] = useState<string>(initialDate.day);
	const [month, setMonth] = useState<string>(initialDate.month);
	const [year, setYear] = useState<string>(initialDate.year);

	const ALL_TIMES = [
		"09:00",
		"10:00",
		"11:00",
		"12:00",
		"13:00",
		"14:00",
		"15:00",
		"16:00",
		"17:00",
	];

	const availableTimes = useMemo(() => {
		const d = parseInt(day);
		const m = parseInt(month);
		const y = parseInt(year);
		if (isNaN(d) || isNaN(m) || isNaN(y)) return ALL_TIMES;

		const isToday =
			y === spainNow.year && m === spainNow.month && d === spainNow.day;
		if (isToday) {
			return ALL_TIMES.filter((t) => {
				const hour = parseInt(t.split(":")[0]);
				return hour > spainNow.hour;
			});
		}

		const selectedDate = new Date(y, m - 1, d);
		const todayDate = new Date(spainNow.year, spainNow.month - 1, spainNow.day);
		if (selectedDate < todayDate) return [];

		return ALL_TIMES;
	}, [day, month, year, spainNow]);

	const [selectedTime, setSelectedTime] = useState<string>("");

	useEffect(() => {
		const d = parseInt(day);
		const m = parseInt(month);
		const y = parseInt(year);

		if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
			if (day.length === 2 && month.length === 2 && year.length === 4) {
				const selectedDate = new Date(y, m - 1, d);
				const todayDate = new Date(
					spainNow.year,
					spainNow.month - 1,
					spainNow.day,
				);
				if (selectedDate < todayDate) {
					setDay(initialDate.day);
					setMonth(initialDate.month);
					setYear(initialDate.year);
				}
			}
		}
	}, [day, month, year, spainNow, initialDate]);

	useEffect(() => {
		if (availableTimes.length > 0) {
			if (!availableTimes.includes(selectedTime)) {
				setSelectedTime(availableTimes[0]);
			}
		} else {
			setSelectedTime("");
		}
	}, [availableTimes, selectedTime]);

	const [loading, setLoading] = useState(false);
	const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
	const [pendingBooking, setPendingBooking] = useState<{
		serviceId: string;
		optionIndex?: number;
	} | null>(null);

	// Auth state
	const [user, setUser] = useState<any>(null);
	const [profile, setProfile] = useState<any>(null);
	const supabaseClient = useMemo(() => createClient(), []);

	useEffect(() => {
		const checkUser = async () => {
			const {
				data: { user },
			} = await supabaseClient.auth.getUser();
			setUser(user);
			if (user) {
				const { data: profile } = await supabaseClient
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single();
				setProfile(profile);
			}
		};
		checkUser();
	}, [supabaseClient]);

	const dayRef = useRef<HTMLInputElement>(null);
	const datePickerRef = useRef<HTMLInputElement>(null);

	const categories = [
		{ id: "all", name: t("categories.all") },
		{ id: "alquileres", name: t("categories.alquileres") },
		{ id: "veleros", name: t("categories.veleros") },
		{ id: "windsurf", name: t("categories.windsurf") },
		{ id: "paddlesurf", name: t("categories.paddlesurf") },
		{ id: "kayak", name: t("categories.kayak") },
		{ id: "piragua", name: t("categories.piragua") },
		{ id: "atraques", name: locale === "eu" ? "Atrakatzeak" : "Atraques" },
		{ id: "membresias", name: t("categories.membresias") },
		{ id: "bonos", name: t("categories.bonos") },
		{ id: "eventos", name: t("categories.eventos") },
	];

	const filteredServices =
		selectedCategory === "all"
			? services
			: services.filter((s) => s.categoria === selectedCategory);

	const handlePickerChange = (val: string) => {
		if (!val) return;
		const [y, m, d] = val.split("-");
		const selectedDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
		const todayDate = new Date(spainNow.year, spainNow.month - 1, spainNow.day);

		if (selectedDate < todayDate) {
			setDay(initialDate.day);
			setMonth(initialDate.month);
			setYear(initialDate.year);
		} else {
			setDay(d);
			setMonth(m);
			setYear(y);
		}
	};

	const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let val = e.target.value.replace(/\D/g, "");
		if (val.length > 2) val = val.slice(0, 2);
		if (val !== "" && parseInt(val) > 31) val = "31";
		setDay(val);
	};

	const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let val = e.target.value.replace(/\D/g, "");
		if (val.length > 2) val = val.slice(0, 2);
		if (val !== "" && parseInt(val) > 12) val = "12";
		setMonth(val);
	};

	const handleWheel = (
		e: React.WheelEvent<HTMLElement>,
		type: "day" | "month" | "year",
	) => {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -1 : 1;
		if (type === "day") {
			const currentDay = parseInt(day) || 1;
			let nextDay = currentDay + delta;
			if (nextDay < 1) nextDay = 31;
			if (nextDay > 31) nextDay = 1;
			setDay(String(nextDay).padStart(2, "0"));
		} else if (type === "month") {
			const currentMonth = parseInt(month) || 1;
			let nextMonth = currentMonth + delta;
			if (nextMonth < 1) nextMonth = 12;
			if (nextMonth > 12) nextMonth = 1;
			setMonth(String(nextMonth).padStart(2, "0"));
		} else if (type === "year") {
			const currentYearNum = parseInt(year) || currentYear;
			let nextYear = currentYearNum + delta;
			if (nextYear < currentYear) nextYear = currentYear + 1;
			else if (nextYear > currentYear + 1) nextYear = currentYear;
			setYear(String(nextYear));
		}
	};

	const handleTimeWheel = (e: React.WheelEvent<HTMLSelectElement>) => {
		if (availableTimes.length === 0) return;
		const currentIndex = availableTimes.indexOf(selectedTime);
		const delta = e.deltaY > 0 ? 1 : -1;
		let nextIndex = currentIndex + delta;
		if (nextIndex < 0) nextIndex = availableTimes.length - 1;
		if (nextIndex >= availableTimes.length) nextIndex = 0;
		setSelectedTime(availableTimes[nextIndex]);
	};

	const handleBooking = async (serviceId: string, optionIndex?: number) => {
		if (!user) {
			router.push(
				`/${locale}/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`,
			);
			return;
		}
		setPendingBooking({ serviceId, optionIndex });
		setIsLegalModalOpen(true);
	};

	const tLegal = useTranslations("legal");

	const handleLegalConfirm = async (legalData: {
		fullName: string;
		email: string;
		dni: string;
	}) => {
		if (!pendingBooking) return;
		setIsLegalModalOpen(false);
		setLoading(true);

		const { serviceId, optionIndex } = pendingBooking;
		let finalYear = parseInt(year);
		if (finalYear < currentYear) finalYear = currentYear;
		if (finalYear > currentYear + 1) finalYear = currentYear + 1;

		if (day.length === 0 || month.length === 0 || selectedTime === "") {
			const params = new URLSearchParams(window.location.search);
			params.set(
				"error",
				selectedTime === ""
					? t("booking.no_times_selected_date")
					: t("booking.invalid_date"),
			);
			router.replace(`${window.location.pathname}?${params.toString()}`, {
				scroll: false,
			});
			dayRef.current?.focus();
			setLoading(false);
			return;
		}

		const dateValue = `${finalYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

		try {
			const consentResponse = await fetch(apiUrl("/api/legal/consent"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fullName: legalData.fullName,
					email: legalData.email,
					dni: legalData.dni,
					legalText: tLegal("consent_acceptance"),
					consentType: "rental",
					referenceId: serviceId,
				}),
			});

			if (!consentResponse.ok) throw new Error(tLegal("error_log_consent"));

			const response = await fetch(apiUrl("/api/checkout/rental"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					serviceId,
					optionIndex,
					locale,
					reservedDate: dateValue,
					reservedTime: selectedTime,
					legalName: legalData.fullName,
					legalDni: legalData.dni,
				}),
			});

			if (response.status === 401) {
				sessionStorage.setItem(
					"pendingRental",
					JSON.stringify({
						serviceId,
						optionIndex,
						reservedDate: dateValue,
						reservedTime: selectedTime,
					}),
				);
				window.location.href = `/${locale}/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
				return;
			}

			const data = await response.json();
			if (data.url) window.location.href = data.url;
			else if (data.error) {
				const params = new URLSearchParams(window.location.search);
				params.set("error", data.error);
				router.replace(`${window.location.pathname}?${params.toString()}`, {
					scroll: false,
				});
			}
		} catch (error) {
			console.error("Booking error:", error);
			const params = new URLSearchParams(window.location.search);
			params.set("error", t("booking.booking_error"));
			router.replace(`${window.location.pathname}?${params.toString()}`, {
				scroll: false,
			});
		} finally {
			setLoading(false);
			setPendingBooking(null);
		}
	};

	const bookingRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (bookingService && bookingRef.current) {
			bookingRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [bookingService]);

	return (
		<div className="space-y-16 pb-48">
			{/* Filter Section */}
			<div className="relative animate-fade-in">
				<div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-nautical-deep to-transparent z-10 pointer-events-none" />
				<div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar scroll-smooth border-b border-white/5">
					{categories.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setSelectedCategory(cat.id)}
							className={`whitespace-nowrap px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border ${
								selectedCategory === cat.id
									? "bg-accent text-nautical-black border-accent shadow-[0_0_25px_rgba(255,77,0,0.25)]"
									: "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
							}`}
						>
							{cat.name}
						</button>
					))}
				</div>
			</div>

			{/* Grid - FIXED to use RentalCard */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
				{filteredServices.map((service) => (
					<RentalCard
						key={service.id}
						service={service}
						locale={locale}
						onBook={(id) => setBookingService(id)}
					/>
				))}
			</div>

			{/* Booking Sheet - Now it's a separate UI state but for now RentalCard triggers it */}
			{bookingService && (
				<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-nautical-black/80 backdrop-blur-md"
						onClick={() => setBookingService(null)}
					/>
					<div className="relative glass-card max-w-lg w-full p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
						<button
							onClick={() => setBookingService(null)}
							className="absolute top-4 right-4 text-white/40 hover:text-white"
						>
							<X className="w-6 h-6" />
						</button>
						<h3 className="text-3xl font-display italic text-white mb-8">
							{t("booking.booking_details")}
						</h3>

						<div className="space-y-8">
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<label className="text-[10px] uppercase tracking-[0.3em] text-accent font-black">
										{t("booking.date_label")}
									</label>
									<div className="flex items-center gap-4 bg-nautical-black/50 border border-white/10 p-4 rounded-sm">
										<input
											ref={dayRef}
											type="text"
											placeholder="DD"
											value={day}
											onChange={handleDayChange}
											onWheel={(e) => handleWheel(e, "day")}
											className="w-8 bg-transparent text-white text-center outline-none font-display italic"
										/>
										<span className="text-white/10">/</span>
										<input
											type="text"
											placeholder="MM"
											value={month}
											onChange={handleMonthChange}
											onWheel={(e) => handleWheel(e, "month")}
											className="w-8 bg-transparent text-white text-center outline-none font-display italic"
										/>
										<span className="text-white/10">/</span>
										<select
											value={year}
											onChange={(e) => setYear(e.target.value)}
											onWheel={(e) => handleWheel(e, "year")}
											className="bg-transparent text-white outline-none cursor-pointer font-display italic"
										>
											<option value={currentYear}>{currentYear}</option>
											<option value={currentYear + 1}>{currentYear + 1}</option>
										</select>
									</div>
								</div>

								<div className="space-y-4">
									<label className="text-[10px] uppercase tracking-[0.3em] text-accent font-black">
										{t("booking.time_label")}
									</label>
									<select
										value={selectedTime}
										onChange={(e) => setSelectedTime(e.target.value)}
										onWheel={handleTimeWheel}
										className="w-full bg-nautical-black/50 border border-white/10 text-white p-4 rounded-sm outline-none font-display italic appearance-none"
									>
										{availableTimes.map((t) => (
											<option key={t} value={t} className="bg-nautical-black">
												{t}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="flex gap-4 pt-4">
								<button
									type="button"
									onClick={() => setBookingService(null)}
									className="flex-1 py-4 border border-white/10 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-white transition-all"
								>
									{t("booking.cancel")}
								</button>
								<button
									type="button"
									onClick={() =>
										handleBooking(
											bookingService,
											bookingOption !== null ? bookingOption : undefined,
										)
									}
									disabled={loading || availableTimes.length === 0}
									className="flex-[2] py-4 bg-accent text-nautical-black text-[10px] uppercase tracking-[0.3em] font-black hover:scale-[1.02] shadow-xl shadow-accent/20 transition-all"
								>
									{loading
										? "..."
										: `${t("booking.confirm")} (${(services.find((s) => s.id === bookingService)?.precio_base || 0) + (bookingOption !== null ? services.find((s) => s.id === bookingService)?.opciones?.[bookingOption]?.extra || 0 : 0)}€)`}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<LegalConsentModal
				isOpen={isLegalModalOpen}
				onClose={() => setIsLegalModalOpen(false)}
				onConfirm={handleLegalConfirm}
				consentType="rental"
				initialData={
					user
						? {
								fullName: profile
									? `${profile.nombre} ${profile.apellidos}`
									: undefined,
								email: user.email,
								dni: profile?.dni,
							}
						: undefined
				}
				legalText={tLegal("rental_contract")}
			/>
		</div>
	);
}

import { X } from "lucide-react";
