import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUnitProgress } from "../useUnitProgress";

// Mock apiUrl
vi.mock("@/lib/api", () => ({
	apiUrl: (url: string) => `http://localhost${url}`,
}));

describe("useUnitProgress hook", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	it("should track reading time correctly", () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: false,
				erroresComunes: undefined,
			}),
		);

		expect(result.current.tiempoLectura).toBe(0);

		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(result.current.tiempoLectura).toBe(3);
	});

	it("should not track time if completed", () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: true,
				erroresComunes: undefined,
			}),
		);

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(result.current.tiempoLectura).toBe(0);
	});

	it("should not track time if unidadId is missing", () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: undefined,
				isCompletado: false,
				erroresComunes: undefined,
			}),
		);

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(result.current.tiempoLectura).toBe(0);
	});

	it("should calculate puedeCompletar correctly based on sections and time", async () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: false,
				erroresComunes: ["error1"], // Total sections = 3
			}),
		);

		expect(result.current.puedeCompletar).toBe(false);
		expect(result.current.mensajeRequisito).toBe(
			"Debes leer todas las secciones antes de completar.",
		);

		// Add 3 sections
		act(() => {
			result.current.setSeccionesVistas(["s1", "s2", "s3"]);
		});

		// Still needs time (needs 30s)
		expect(result.current.puedeCompletar).toBe(false);
		expect(result.current.mensajeRequisito).toBe(
			"Debes dedicar al menos 5 minutos a la lectura.",
		);

		act(() => {
			vi.advanceTimersByTime(31000);
		});

		expect(result.current.puedeCompletar).toBe(true);
		expect(result.current.mensajeRequisito).toBeNull();
	});

	it("should register section view via API and update state", async () => {
		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		} as Response);

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
				body: JSON.stringify({
					unidad_id: "u1",
					seccion: "section-1",
				}),
			}),
		);
	});

	it("should not register if unidadId is missing", async () => {
		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: undefined,
				isCompletado: false,
				erroresComunes: [],
			}),
		);

		await act(async () => {
			await result.current.registrarLectura("section-1");
		});

		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("should log warning if API returns success: false", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			json: async () => ({ success: false }),
		} as Response);

		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: false,
				erroresComunes: [],
			}),
		);

		await act(async () => {
			await result.current.registrarLectura("section-error");
		});

		expect(result.current.seccionesVistas).toContain("section-error");
		expect(warnSpy).toHaveBeenCalledWith("Failed to register section read");
		warnSpy.mockRestore();
	});

	it("should log error if fetch throws exception", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(global.fetch).mockRejectedValue(new Error("Network Error"));

		const { result } = renderHook(() =>
			useUnitProgress({
				unidadId: "u1",
				isCompletado: false,
				erroresComunes: [],
			}),
		);

		await act(async () => {
			await result.current.registrarLectura("section-exception");
		});

		expect(result.current.seccionesVistas).toContain("section-exception");
		expect(errorSpy).toHaveBeenCalledWith(
			"Error registering read:",
			expect.any(Error),
		);
		errorSpy.mockRestore();
	});
});
