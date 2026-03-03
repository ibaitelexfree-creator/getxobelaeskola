import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStreakMessage } from "@/lib/academy/motivational-messages";
import { useNotificationStore } from "@/lib/store/useNotificationStore";
import { createClient } from "@/lib/supabase/client";
import ActivityTracker from "./ActivityTracker";

// Mocks
vi.mock("@/lib/supabase/client", () => ({
	createClient: vi.fn(),
}));

vi.mock("@/lib/store/useNotificationStore", () => ({
	useNotificationStore: vi.fn(),
}));

vi.mock("@/lib/academy/motivational-messages", () => ({
	getStreakMessage: vi.fn().mockReturnValue("Keep going!"),
}));

describe("ActivityTracker", () => {
	let mockSupabase: any;
	let mockAddNotification: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockAddNotification = vi.fn();
		(useNotificationStore as any).mockImplementation((selector: any) =>
			selector({ addNotification: mockAddNotification }),
		);

		mockSupabase = {
			auth: {
				getUser: vi
					.fn()
					.mockResolvedValue({ data: { user: { id: "user-123" } } }),
			},
			rpc: vi.fn().mockResolvedValue({ error: null }),
			from: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			single: vi
				.fn()
				.mockResolvedValue({ data: { current_streak: 5 }, error: null }),
		};
		(createClient as any).mockReturnValue(mockSupabase);
	});

	it("should track activity and show notification on mount", async () => {
		render(<ActivityTracker />);

		await waitFor(() => {
			expect(mockSupabase.rpc).toHaveBeenCalledWith(
				"registrar_actividad_alumno",
				{ p_alumno_id: "user-123" },
			);
			expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
			expect(getStreakMessage).toHaveBeenCalledWith(5);
			expect(mockAddNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "info",
					title: "¡Racha en llamas! 🔥",
					message: "Keep going!",
				}),
			);
		});
	});

	it("should handle missing user silently", async () => {
		mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
		render(<ActivityTracker />);

		await new Promise((r) => setTimeout(r, 100)); // Wait a bit
		expect(mockSupabase.rpc).not.toHaveBeenCalled();
	});
});
