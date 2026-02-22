import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://getxobelaeskola.cloud";
	const locales = ["es", "eu", "en", "fr"];
	const staticPaths = [
		"",
		"/courses",
		"/academy",
		"/rental",
		"/about",
		"/contact",
	];

	const sitemapEntries: MetadataRoute.Sitemap = [];

	// Static Paths
	locales.forEach((locale) => {
		staticPaths.forEach((path) => {
			sitemapEntries.push({
				url: `${baseUrl}/${locale}${path}`,
				lastModified: new Date(),
				changeFrequency: path === "" ? "daily" : "weekly",
				priority: path === "" ? 1.0 : 0.8,
			});
		});
	});

	// Dynamic Course Paths
	try {
		const supabase = createAdminClient();
		const { data: courses } = (await supabase
			.from("cursos")
			.select("slug")
			.eq("activo", true)
			.eq("visible", true)) as { data: { slug: string }[] | null };

		if (courses) {
			locales.forEach((locale) => {
				courses.forEach((course) => {
					sitemapEntries.push({
						url: `${baseUrl}/${locale}/courses/${course.slug}`,
						lastModified: new Date(),
						changeFrequency: "weekly",
						priority: 0.7,
					});
				});
			});
		}
	} catch (e) {
		console.error("Sitemap dynamic paths error:", e);
	}

	return sitemapEntries;
}
