import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationStore } from "@/lib/store/useNotificationStore";
import {
	useAcademyFeedback,
	useAnimationPreferences,
} from "./useAcademyFeedback";

// Mocks
vi.mock("@/lib/store/useNotificationStore", () => ({
	useNotificationStore: vi.fn(),
}));

describe("useAcademyFeedback", () => {
	let mockAddNotification: any;
	let mockLocalStorage: any;
	let consoleSpy: any;

	beforeEach(() => {
		vi.clearAllMocks();

		let store: Record<string, string> = {};
		mockLocalStorage = {
			getItem: vi.fn((key: string) => store[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				store[key] = value;
			}),
			clear: vi.fn(() => {
				store = {};
			}),
			removeItem: vi.fn((key: string) => {
				delete store[key];
			}),
		};
		vi.stubGlobal("localStorage", mockLocalStorage);
		vi.stubGlobal("fetch", vi.fn());

		mockAddNotification = vi.fn();
		(useNotificationStore as any).mockImplementation((selector: any) =>
			selector({ addNotification: mockAddNotification }),
		);

		consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it("should show achievement notification", () => {
		const { result } = renderHook(() => useAcademyFeedback());

		const achievement = {
			id: "ach-1",
			nombre_es: "Capi",
			nombre_eu: "Kapita",
			descripcion_es: "Desc",
			icono: "⚓",
			rareza: "comun" as const,
			puntos: 50,
		};

		act(() => {
			result.current.showAchievement(achievement, "es");
		});

		expect(mockAddNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "achievement",
				title: "Capi",
				icon: "⚓",
			}),
		);
	});

	it("should prevent duplicate achievement notifications", () => {
		const { result } = renderHook(() => useAcademyFeedback());
		const achievement = {
			id: "ach-1",
			nombre_es: "A",
			nombre_eu: "B",
			descripcion_es: "C",
			icono: "X",
			rareza: "comun" as const,
			puntos: 10,
		};

		act(() => {
			result.current.showAchievement(achievement);
			result.current.showAchievement(achievement); // Second call
		});

		expect(mockAddNotification).toHaveBeenCalledTimes(1);
	});

	it("should update localStorage with new achievements", async () => {
		const mockResponse = [{ id: "ach-1" }, { id: "ach-2" }];
		(global.fetch as any).mockResolvedValue({
			json: vi.fn().mockResolvedValue(mockResponse),
		});

		const { result } = renderHook(() => useAcademyFeedback());

		await act(async () => {
			await result.current.checkForNewAchievements();
		});

		expect(localStorage.getItem("sailing_achievements")).toBe(
			JSON.stringify(["ach-1", "ach-2"]),
		);
	});

	it("should handle fetch errors in checkForNewAchievements", async () => {
		(global.fetch as any).mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useAcademyFeedback());

		await act(async () => {
			await result.current.checkForNewAchievements();
		});

		expect(consoleSpy).toHaveBeenCalledWith(
			"Error checking achievements:",
			expect.any(Error),
		);
	});

	it("should handle invalid JSON in checkForNewAchievements", async () => {
		(global.fetch as any).mockResolvedValue({
			json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
		});

		const { result } = renderHook(() => useAcademyFeedback());

		await act(async () => {
			await result.current.checkForNewAchievements();
		});

		expect(consoleSpy).toHaveBeenCalledWith(
			"Error checking achievements:",
			expect.any(Error),
		);
	});
});

describe("useAnimationPreferences", () => {
	let consoleSpy: any;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it("should load initial preference from localStorage", () => {
		localStorage.setItem("animations_enabled", "false");
		const { result } = renderHook(() => useAnimationPreferences());

		// Use waitFor because useEffect is async
		return waitFor(() => expect(result.current.animationsEnabled).toBe(false));
	});

	it("should toggle and persist animation preference", async () => {
		localStorage.removeItem("animations_enabled"); // Force null -> default true
		(global.fetch as any).mockResolvedValue({ ok: true });

		const { result } = renderHook(() => useAnimationPreferences());

		// Should start as true
		expect(result.current.animationsEnabled).toBe(true);

		await act(async () => {
			await result.current.toggleAnimations();
		});

		expect(result.current.animationsEnabled).toBe(false);
		expect(localStorage.getItem("animations_enabled")).toBe("false");
	});

	it("should revert animation preference on API error", async () => {
		localStorage.setItem("animations_enabled", "true");
		(global.fetch as any).mockRejectedValue(new Error("API error"));

		const { result } = renderHook(() => useAnimationPreferences());

		// Wait for initial load
		await waitFor(() => expect(result.current.animationsEnabled).toBe(true));

		await act(async () => {
			await result.current.toggleAnimations();
		});

		// Should revert to true
		expect(result.current.animationsEnabled).toBe(true);
		expect(localStorage.getItem("animations_enabled")).toBe("true");
		expect(consoleSpy).toHaveBeenCalledWith(
			"Error saving animation preference:",
			expect.any(Error),
		);
	});
});
