import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileCourseList from "./MobileCourseList";

// Mock framer-motion to simplify testing
vi.mock("framer-motion", () => ({
	motion: {
		div: ({
			children,
			className,
			...props
		}: {
			children: React.ReactNode;
			className?: string;
		}) => (
			<div className={className} {...props}>
				{children}
			</div>
		),
		span: ({
			children,
			className,
			...props
		}: {
			children: React.ReactNode;
			className?: string;
		}) => (
			<span className={className} {...props}>
				{children}
			</span>
		),
		p: ({
			children,
			className,
			...props
		}: {
			children: React.ReactNode;
			className?: string;
		}) => (
			<p className={className} {...props}>
				{children}
			</p>
		),
	},
	AnimatePresence: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

// Mock next/image
vi.mock("next/image", () => ({
	__esModule: true,
	default: (props: { alt: string }) => {
		// eslint-disable-next-line @next/next/no-img-element
		return <img {...props} alt={props.alt} />;
	},
}));

// Mock fetch globally
global.fetch = vi.fn();

describe("MobileCourseList", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders loading state initially", async () => {
		vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {})); // Never resolves
		render(<MobileCourseList locale="es" />);
		const loader = document.querySelector(".animate-spin");
		expect(loader).toBeDefined();
	});

	it("renders courses when fetch is successful", async () => {
		const mockCourses = {
			cursos: [
				{
					id: "1",
					slug: "test-course",
					nombre_es: "Test Course ES",
					nombre_eu: "Test Course EU",
					descripcion_es: "Desc ES",
					descripcion_eu: "Desc EU",
					imagen_url: "http://test.com/image.jpg",
					precio: 100,
					categoria: { nombre_es: "Cat ES", nombre_eu: "Cat EU" },
				},
			],
		};

		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			json: async () => mockCourses,
		} as Response);

		render(<MobileCourseList locale="es" />);

		await waitFor(() => {
			expect(screen.getByText("Test Course ES")).toBeDefined();
		});
		expect(screen.getByText("Cat ES")).toBeDefined();
	});

	it("renders fallback courses when fetch fails (network error)", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

		render(<MobileCourseList locale="es" />);

		await waitFor(() => {
			// "Iniciación J80" is one of the FALLBACK_COURSES
			expect(screen.getByText("Iniciación J80")).toBeDefined();
		});
		expect(consoleSpy).toHaveBeenCalledWith(
			"Error fetching courses:",
			expect.any(Error),
		);
		consoleSpy.mockRestore();
	});

	it("renders fallback courses when response is not ok (404/500)", async () => {
		vi.mocked(global.fetch).mockResolvedValue({
			ok: false,
			status: 500,
		} as Response);

		render(<MobileCourseList locale="es" />);

		await waitFor(() => {
			expect(screen.getByText("Iniciación J80")).toBeDefined();
		});
	});

	it("renders fallback courses when API returns empty list", async () => {
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			json: async () => ({ cursos: [] }),
		} as Response);

		render(<MobileCourseList locale="es" />);

		await waitFor(() => {
			expect(screen.getByText("Iniciación J80")).toBeDefined();
		});
		expect(consoleSpy).toHaveBeenCalledWith(
			"API returned empty courses, using fallback.",
		);
		consoleSpy.mockRestore();
	});

	it("filters courses based on search input", async () => {
		const mockCourses = {
			cursos: [
				{
					id: "1",
					slug: "course-1",
					nombre_es: "Sailboat Course",
					nombre_eu: "Sailboat Course EU",
					descripcion_es: "Desc 1",
					descripcion_eu: "Desc 1 EU",
					imagen_url: "",
					precio: 100,
				},
				{
					id: "2",
					slug: "course-2",
					nombre_es: "Motorboat Course",
					nombre_eu: "Motorboat Course EU",
					descripcion_es: "Desc 2",
					descripcion_eu: "Desc 2 EU",
					imagen_url: "",
					precio: 200,
				},
			],
		};

		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			json: async () => mockCourses,
		} as Response);

		render(<MobileCourseList locale="es" />);

		await waitFor(() => {
			expect(screen.getByText("Sailboat Course")).toBeDefined();
			expect(screen.getByText("Motorboat Course")).toBeDefined();
		});

		// Open search first
		const searchButton = screen.getByLabelText("Search");
		fireEvent.click(searchButton);

		const searchInput = screen.getByPlaceholderText("Buscar...");
		fireEvent.change(searchInput, { target: { value: "Sailboat" } });

		expect(screen.getByText("Sailboat Course")).toBeDefined();
		expect(screen.queryByText("Motorboat Course")).toBeNull();
	});
});
