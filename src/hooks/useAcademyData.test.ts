import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAcademyData } from "./useAcademyData";

// Mock global fetch
global.fetch = vi.fn();

describe("useAcademyData", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch all data in parallel and map correctly", async () => {
		const mockLevels = { niveles: [{ id: "L1", slug: "level-1" }] };
		const mockCourses = { cursos: [{ id: "C1", nivel_formacion_id: "L1" }] };
		const mockProgress = {
			progreso: [
				{ tipo_entidad: "nivel", nivel_id: "L1", estado: "en_progreso" },
			],
			is_staff: false,
		};
		const mockEnrollments = { enrollments: ["C1"] };
		const mockUnlock = { niveles: { L1: "available" } };

		(global.fetch as any).mockImplementation((url: string) => {
			if (url.includes("/api/levels"))
				return Promise.resolve({ ok: true, json: async () => mockLevels });
			if (url.includes("/api/courses"))
				return Promise.resolve({ ok: true, json: async () => mockCourses });
			if (url.includes("/api/progress"))
				return Promise.resolve({ ok: true, json: async () => mockProgress });
			if (url.includes("/api/enrollments"))
				return Promise.resolve({ ok: true, json: async () => mockEnrollments });
			if (url.includes("/api/unlock-status"))
				return Promise.resolve({ ok: true, json: async () => mockUnlock });
			return Promise.reject(new Error("Unknown URL"));
		});

		const { result } = renderHook(() => useAcademyData());

		expect(result.current.loading).toBe(true);

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.niveles).toEqual(mockLevels.niveles);
		expect(result.current.cursosPorNivel["L1"]).toHaveLength(1);
		expect(result.current.enrollments).toEqual(["C1"]);
		expect(result.current.error).toBeNull();
	});

	it("should handle critical fetch error (levels)", async () => {
		(global.fetch as any).mockImplementation((url: string) => {
			if (url.includes("/api/levels"))
				return Promise.resolve({
					ok: false,
					status: 500,
					json: async () => ({ error: "Fatal" }),
				});
			return Promise.resolve({ ok: true, json: async () => ({}) });
		});

		const { result } = renderHook(() => useAcademyData());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe("Fatal");
		expect(result.current.niveles).toEqual([]);
	});

	it("should handle network failure", async () => {
		(global.fetch as any).mockImplementation(() =>
			Promise.reject(new Error("Network Error")),
		);

		const { result } = renderHook(() => useAcademyData());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe("Network Error");
	});

	it("should handle non-Error exceptions", async () => {
		(global.fetch as any).mockImplementation(() => {
			throw "Something went wrong"; // Throwing a string, not an Error object
		});

		const { result } = renderHook(() => useAcademyData());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe("Error desconocido");
	});

	it("should handle malformed JSON in levels fetch", async () => {
		(global.fetch as any).mockImplementation((url: string) => {
			if (url.includes("/api/levels")) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.reject(new Error("Unexpected token")),
				});
			}
			return Promise.resolve({ ok: true, json: async () => ({}) });
		});

		const { result } = renderHook(() => useAcademyData());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe("Unexpected token");
	});

	describe("getEstadoNivel", () => {
		it("should return correct state based on unlockStatus", async () => {
			(global.fetch as any).mockResolvedValue({
				ok: true,
				json: async () => ({
					niveles: [],
					cursos: [],
					enrollments: [],
					progreso: [],
					niveles_unlock: { L1: "available" },
				}),
			});

			// Setup mock implementation again for detailed control
			(global.fetch as any).mockImplementation((url: string) => {
				if (url.includes("/api/levels"))
					return Promise.resolve({
						ok: true,
						json: async () => ({ niveles: [{ id: "L1" }] }),
					});
				if (url.includes("/api/unlock-status"))
					return Promise.resolve({
						ok: true,
						json: async () => ({ niveles: { L1: "available" } }),
					});
				return Promise.resolve({ ok: true, json: async () => ({}) });
			});

			const { result } = renderHook(() => useAcademyData());
			await waitFor(() => expect(result.current.loading).toBe(false));

			const level = { id: "L1" } as any;
			expect(result.current.getEstadoNivel(level)).toBe("disponible");
		});

		it("should return locked if not enrolled in any course of the level", async () => {
			(global.fetch as any).mockImplementation((url: string) => {
				if (url.includes("/api/levels"))
					return Promise.resolve({
						ok: true,
						json: async () => ({ niveles: [{ id: "L1" }] }),
					});
				if (url.includes("/api/courses"))
					return Promise.resolve({
						ok: true,
						json: async () => ({
							cursos: [{ id: "C1", nivel_formacion_id: "L1" }],
						}),
					});
				if (url.includes("/api/enrollments"))
					return Promise.resolve({
						ok: true,
						json: async () => ({ enrollments: [] }),
					});
				return Promise.resolve({ ok: true, json: async () => ({}) });
			});

			const { result } = renderHook(() => useAcademyData());
			await waitFor(() => expect(result.current.loading).toBe(false));

			const level = { id: "L1" } as any;
			expect(result.current.getEstadoNivel(level)).toBe("bloqueado");
		});
	});
});
