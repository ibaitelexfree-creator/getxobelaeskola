"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ActivityListClient from "@/components/staff/ActivityListClient";
import { createClient } from "@/lib/supabase/client";

interface StaffActivityContainerProps {
	userId: string;
	locale: string;
}

export default function StaffActivityContainer({
	userId,
	locale,
}: StaffActivityContainerProps) {
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [staff, setStaff] = useState<any>(null);
	const [logs, setLogs] = useState<any[]>([]);
	const [allProfiles, setAllProfiles] = useState<any[]>([]);

	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		async function loadData() {
			try {
				// 1. Check Auth
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					router.push(`/${locale}/login`);
					return;
				}

				// 2. Check Role
				const { data: requesterProfile } = await supabase
					.from("profiles")
					.select("rol")
					.eq("id", user.id)
					.single();

				if (
					!requesterProfile ||
					(requesterProfile.rol !== "admin" &&
						requesterProfile.rol !== "instructor")
				) {
					router.push(`/${locale}/student/dashboard`);
					return;
				}

				setAuthorized(true);
				setIsAdmin(requesterProfile.rol === "admin");

				// 3. Load Target Staff Data if not placeholder
				if (userId && userId !== "placeholder") {
					const { data: staffData } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", userId)
						.single();

					if (staffData) {
						setStaff(staffData);

						// 4. Load Logs
						const { data: logsData } = await supabase
							.from("audit_logs")
							.select("*")
							.eq("staff_id", userId)
							.order("created_at", { ascending: false });

						setLogs(logsData || []);
					}
				}

				// 5. Load All Profiles (for reference)
				const { data: profilesData } = await supabase
					.from("profiles")
					.select("id, nombre, apellidos, rol");

				setAllProfiles(profilesData || []);
			} catch (error) {
				console.error("Error loading staff activity:", error);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, [userId, locale, router, supabase]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<div className="animate-pulse text-accent uppercase tracking-widest text-xs">
					Cargando historial...
				</div>
			</div>
		);
	}

	if (!authorized) return null;

	if (!staff && userId !== "placeholder") {
		return (
			<div className="text-center py-20">
				<h2 className="text-white text-xl">Staff no encontrado</h2>
				<Link
					href={`/${locale}/staff`}
					className="text-accent underline mt-4 block"
				>
					Volver
				</Link>
			</div>
		);
	}

	if (userId === "placeholder") {
		return (
			<div className="text-center py-20">
				<h2 className="text-white text-xl">Selecciona un miembro del staff</h2>
				<Link
					href={`/${locale}/staff`}
					className="text-accent underline mt-4 block"
				>
					Volver al panel
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto relative z-10">
			<Link
				href={`/${locale}/staff`}
				className="text-[10px] uppercase tracking-widest text-white/40 hover:text-accent mb-8 block transition-all"
			>
				← Volver al Panel
			</Link>

			<header className="mb-16">
				<span className="text-accent uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">
					Historial de Operaciones
				</span>
				<h1 className="text-5xl font-display italic">
					Actividad de{" "}
					<span className="text-accent">
						{staff.nombre} {staff.apellidos}
					</span>
				</h1>
				<p className="text-technical mt-4 opacity-40 uppercase tracking-widest">
					{staff.rol}
				</p>
			</header>

			<ActivityListClient
				initialLogs={logs}
				isAdmin={isAdmin}
				allProfiles={allProfiles}
			/>
		</div>
	);
}
