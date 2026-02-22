"use client";

import { useSearchParams } from "next/navigation";
import CourseCard from "./CourseCard";
import CourseFilters from "./CourseFilters";

interface Category {
	id: string;
	nombre_es: string;
	nombre_eu: string;
	slug: string;
}

interface CourseListClientProps {
	initialCourses: any[];
	categories: Category[];
	locale: string;
}

export default function CoursesListClient({
	initialCourses,
	categories,
	locale,
}: CourseListClientProps) {
	const searchParams = useSearchParams();
	const activeCategory = searchParams.get("category");

	// Client-side filtering
	const displayCourses = activeCategory
		? initialCourses.filter((course) => course.categoria_id === activeCategory)
		: initialCourses;

	return (
		<section className="pb-48 relative overflow-hidden">
			<div className="container mx-auto px-6 relative z-10">
				<CourseFilters categories={categories || []} locale={locale} />

				{displayCourses.length === 0 ? (
					<div className="text-center py-20 animate-fade-in">
						<div className="inline-block p-8 border border-white/10 rounded-2xl bg-white/5">
							<span className="text-4xl mb-4 block">🔍</span>
							<h3 className="text-xl font-display text-white mb-2">
								{locale === "eu"
									? "Ez da ikastarorik aurkitu"
									: "No se encontraron cursos"}
							</h3>
							<p className="text-white/50 max-w-md mx-auto">
								{locale === "eu"
									? "Saiatu beste kategoria batekin edo garbitu iragazkiak."
									: "Intenta con otra categoría o limpia los filtros."}
							</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
						{displayCourses.map((course) => (
							<CourseCard key={course.id} course={course} locale={locale} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
