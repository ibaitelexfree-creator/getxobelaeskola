import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAcademyAccess } from "./useAcademyAccess";

// Mock global fetch
global.fetch = vi.fn();

describe("useAcademyAccess", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with loading true and statusMap null", async () => {
		(global.fetch as any).mockResolvedValue({
			json: async () => ({}),
		});

		const { result } = renderHook(() => useAcademyAccess());

		expect(result.current.loading).toBe(true);
		expect(result.current.statusMap).toBeNull();

		await waitFor(() => expect(result.current.loading).toBe(false));
	});

	it("should fetch status map correctly", async () => {
		const mockMap = {
			niveles: { n1: "available" },
			cursos: { c1: "locked" },
			modulos: {},
			unidades: {},
		};

		(global.fetch as any).mockResolvedValue({
			json: async () => mockMap,
		});

		const { result } = renderHook(() => useAcademyAccess());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.statusMap).toEqual(mockMap);
	});

	describe("canAccess", () => {
		it("should return true for available entity", async () => {
			const mockMap = {
				niveles: { n1: "available" },
				cursos: {},
				modulos: {},
				unidades: {},
			};
			(global.fetch as any).mockResolvedValue({ json: async () => mockMap });

			const { result } = renderHook(() => useAcademyAccess());
			await waitFor(() => expect(result.current.loading).toBe(false));

			expect(result.current.canAccess("nivel", "n1")).toBe(true);
		});

		it("should return false for locked entity", async () => {
			const mockMap = {
				niveles: { n1: "locked" },
				cursos: {},
				modulos: {},
				unidades: {},
			};
			(global.fetch as any).mockResolvedValue({ json: async () => mockMap });

			const { result } = renderHook(() => useAcademyAccess());
			await waitFor(() => expect(result.current.loading).toBe(false));

			expect(result.current.canAccess("nivel", "n1")).toBe(false);
		});

		it("should return false for unknown entity", async () => {
			const mockMap = { niveles: {}, cursos: {}, modulos: {}, unidades: {} };
			(global.fetch as any).mockResolvedValue({ json: async () => mockMap });

			const { result } = renderHook(() => useAcademyAccess());
			await waitFor(() => expect(result.current.loading).toBe(false));

			expect(result.current.canAccess("nivel", "unknown")).toBe(false);
		});
	});
});
