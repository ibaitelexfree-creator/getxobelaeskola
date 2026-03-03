import AcademyMain from "./AcademyMain";

export async function generateMetadata({
	params: { locale },
}: {
	params: { locale: string };
}) {
	return {
		title: locale === "eu" ? "Akademia Digitala" : "Academia Digital",
		description:
			locale === "eu"
				? "Zure prestakuntza bidaia Getxon. Nabigatu 7 mailatan zehar, hasiberritik kapitainera."
				: "Tu Viaje de Formación en Getxo. Navega por los 7 niveles de formación náutica, desde principiante hasta capitán.",
	};
}

export default function AcademyMapPage({
	params,
}: {
	params: { locale: string };
}) {
	return <AcademyMain params={params} />;
}
