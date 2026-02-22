import { redirect } from "next/navigation";
import LogbookForm from "@/components/logbook/LogbookForm";
import LogbookList from "@/components/logbook/LogbookList";
import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import type { LogbookEntry } from "@/types/logbook";

export const dynamic = "force-dynamic";

export default async function LogbookPage() {
	// 1. Auth Check
	const { user, error } = await requireAuth();
	if (error || !user) {
		redirect("/auth/login");
	}

	const supabase = createClient();

	// 2. Fetch User Profile
	const { data: profile } = await supabase
		.from("profiles")
		.select("nombre, apellidos")
		.eq("id", user.id)
		.single();

	const studentName = profile
		? `${profile.nombre} ${profile.apellidos}`
		: "Alumno";

	// 3. Fetch Logbook Entries
	const { data: rawEntries, error: fetchError } = await supabase
		.from("bitacora_personal")
		.select("*")
		.eq("alumno_id", user.id)
		.order("fecha", { ascending: false });

	if (fetchError) {
		console.error("Error fetching logbook:", fetchError);
	}

	// Cast to strict type if needed, assuming DB matches
	const entries = (rawEntries || []) as unknown as LogbookEntry[];

	return (
		<div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-8">
				<div className="text-center space-y-4">
					<h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">
						Cuaderno de <span className="text-accent">Bitácora</span>
					</h1>
					<p className="text-sea-foam/60 text-lg max-w-2xl mx-auto font-light">
						Registra cada salida al mar, condiciones meteorológicas y maniobras
						practicadas. Tu historial náutico oficial en Getxo Bela Eskola.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Form Section (Left, smaller) */}
					<div className="lg:col-span-4 sticky top-24">
						<LogbookForm />
					</div>

					{/* List Section (Right, larger) */}
					<div className="lg:col-span-8">
						<LogbookList entries={entries} studentName={studentName} />
					</div>
				</div>
			</div>
		</div>
	);
}
