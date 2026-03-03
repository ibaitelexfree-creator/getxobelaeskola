import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAcademyAccess } from "../useAcademyAccess";

// Mock apiUrl
vi.mock("@/lib/api", () => ({
	apiUrl: (url: string) => `http://localhost${url}`,
}));

describe("useAcademyAccess hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	it("should fetch status on mount", async () => {
		const mockMap = {
			niveles: { n1: "available" },
			cursos: {},
			modulos: {},
			unidades: {},
		};
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockMap,
		});

		const { result } = renderHook(() => useAcademyAccess());

		// Wait for fetch inside useEffect
		await act(async () => {
			// Wait for the async effect to complete
		});

		expect(result.current.statusMap).toEqual(mockMap);
		expect(result.current.loading).toBe(false);
		expect(result.current.canAccess("nivel", "n1")).toBe(true);
	});

	it("should block access if locked or missing", async () => {
		const mockMap = {
			niveles: { n1: "locked" },
			cursos: {},
			modulos: {},
			unidades: {},
		};
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockMap,
		});

		const { result } = renderHook(() => useAcademyAccess());

		await act(async () => {});

		expect(result.current.canAccess("nivel", "n1")).toBe(false);
		expect(result.current.canAccess("curso", "c1")).toBe(false);
	});
});
