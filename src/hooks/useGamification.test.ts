import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationStore } from "@/lib/store/useNotificationStore";
import { useGamification } from "./useGamification";

// Mock store
vi.mock("@/lib/store/useNotificationStore", () => ({
	useNotificationStore: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe("useGamification", () => {
	const mockAddNotification = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useNotificationStore as any).mockImplementation((selector: any) =>
			selector({ addNotification: mockAddNotification }),
		);
	});

	it("should fetch badges correctly", async () => {
		const mockBadges = [{ id: "b1", slug: "badge-1", nombre_es: "Badge 1" }];
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

	it("should unlock badge and notify", async () => {
		const mockAchievement = { id: "ach1", nombre: "Winner!", puntos: 100 };
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({ new: true, achievement: mockAchievement }),
		});

		const { result } = renderHook(() => useGamification());

		await act(async () => {
			await result.current.unlockBadge("winner-slug");
		});

		expect(mockAddNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "badge",
				title: "Winner!",
				icon: "🏆",
			}),
		);
	});
});
