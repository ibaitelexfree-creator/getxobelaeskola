import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export async function generateMetadata({
	params: { locale },
}: {
	params: { locale: string };
}): Promise<Metadata> {
	const isEu = locale === "eu";
	const title = isEu ? "Pasahitza berreskuratu" : "Recuperar Contraseña";
	const description = isEu
		? "Berreskuratu zure Getxo Bela Eskolako kontuaren pasahitza."
		: "Recupera la contraseña de tu cuenta de Getxo Bela Eskola.";

	return { title, description };
}

export function generateStaticParams() {
	return ["es", "eu", "en", "fr"].map((locale) => ({ locale }));
}

export default function ForgotPasswordPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	return <ForgotPasswordClient locale={locale} />;
}
