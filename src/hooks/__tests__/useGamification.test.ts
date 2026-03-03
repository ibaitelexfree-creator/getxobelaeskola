import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGamification } from "../useGamification";

// Mock notification store
vi.mock("@/lib/store/useNotificationStore", () => ({
	useNotificationStore: vi.fn((selector) => {
		const mockAdd = vi.fn();
		return selector({ addNotification: mockAdd });
	}),
}));

// Mock apiUrl
vi.mock("@/lib/api", () => ({
	apiUrl: (url: string) => `http://localhost${url}`,
}));

describe("useGamification hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	it("should fetch badges on call", async () => {
		const mockBadges = [{ id: "1", slug: "s" }];
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockBadges,
		});

		const { result } = renderHook(() => useGamification());

		await act(async () => {
			await result.current.fetchBadges();
		});

		expect(result.current.badges).toEqual(mockBadges);
		expect(result.current.loading).toBe(false);
	});

	it("should handle fetch error", async () => {
		(global.fetch as any).mockResolvedValue({
			ok: false,
		});

		const { result } = renderHook(() => useGamification());

		await act(async () => {
			await result.current.fetchBadges();
		});

		expect(result.current.badges).toEqual([]);
		expect(result.current.loading).toBe(false);
	});

	it("should unlock badge and notify", async () => {
		const mockResponse = {
			new: true,
			achievement: { nombre: "Gold", puntos: 100 },
		};
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		});

		const { result } = renderHook(() => useGamification());

		await act(async () => {
			await result.current.unlockBadge("gold");
		});

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/achievements"),
			expect.objectContaining({ method: "POST" }),
		);
	});
});
