import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUnitProgress } from "./useUnitProgress";

// Mock fetch
global.fetch = vi.fn();

describe("useUnitProgress", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	it("should increment reading time correctly", () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: false,
				erroresComunes: [],
			}),
		);

		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(result.current.tiempoLectura).toBe(3);
	});

	it("should stop timer if isCompletado is true", () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: true,
				erroresComunes: [],
			}),
		);

		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(result.current.tiempoLectura).toBe(0);
	});

	it("should calculate canAccess correctly based on sections and time", async () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: false,
				erroresComunes: ["error1"], // Total sections = 3
			}),
		);

		expect(result.current.puedeCompletar).toBe(false);

		// Add 3 sections
		act(() => {
			result.current.setSeccionesVistas(["s1", "s2", "s3"]);
		});

		// Still needs time (needs 30s)
		expect(result.current.puedeCompletar).toBe(false);

		act(() => {
			vi.advanceTimersByTime(31000);
		});

		expect(result.current.puedeCompletar).toBe(true);
	});

	it("should register section view via API", async () => {
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});

		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: false,
				erroresComunes: [],
			}),
		);

		await act(async () => {
			await result.current.registrarLectura("section-1");
		});

		expect(result.current.seccionesVistas).toContain("section-1");
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/progress/unit-read"),
			expect.objectContaining({
				method: "POST",
				body: expect.stringContaining("section-1"),
			}),
		);
	});
});
