import type { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

export async function generateMetadata({
	params: { locale },
}: {
	params: { locale: string };
}): Promise<Metadata> {
	const isEu = locale === "eu";
	const title = isEu ? "Izena eman" : "Registrarse";
	const description = isEu
		? "Sortu zure kontua Getxo Bela Eskolan eta hasi zure itsas bidaia."
		: "Crea tu cuenta en Getxo Bela Eskola y comienza tu aventura marítima.";

	return { title, description };
}

export function generateStaticParams() {
	return ["es", "eu", "en", "fr"].map((locale) => ({ locale }));
}

export default function RegisterPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	return <RegisterPageClient params={{ locale }} />;
}
