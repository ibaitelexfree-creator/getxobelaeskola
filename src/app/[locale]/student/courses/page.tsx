import { getTranslations } from "next-intl/server";
import MobileCourseList from "@/components/student/MobileCourseList";

export function generateStaticParams() {
	return ["es", "eu", "en", "fr"].map((locale) => ({ locale }));
}

export default async function MobileCoursesPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	// We could pass translations here if needed, but the component handles basic strings
	return (
		<main className="min-h-screen bg-nautical-black">
			<MobileCourseList locale={locale} />
		</main>
	);
}
