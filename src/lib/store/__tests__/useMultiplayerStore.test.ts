import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMultiplayerStore } from "../useMultiplayerStore";

// Mock Supabase
vi.mock("@/lib/supabase/client", () => {
	const mockSingle = vi.fn().mockResolvedValue({
		data: { id: "lobby-1", code: "TEST12", host_id: "user-1" },
		error: null,
	});
	const mockQuery = {
		eq: vi.fn().mockReturnThis(),
		single: mockSingle,
		select: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
	};
	mockQuery.eq.mockReturnValue(mockQuery);
	mockQuery.select.mockReturnValue(mockQuery);
	mockQuery.insert.mockReturnValue(mockQuery);

	return {
		createClient: () => ({
			from: vi.fn().mockReturnValue(mockQuery),
			channel: vi.fn(() => ({
				on: vi.fn().mockReturnThis(),
				subscribe: vi.fn((cb) => cb("SUBSCRIBED")),
				send: vi.fn(),
			})),
			removeChannel: vi.fn().mockResolvedValue(null),
		}),
	};
});

describe("useMultiplayerStore", () => {
	beforeEach(() => {
		useMultiplayerStore.getState().reset();
		vi.clearAllMocks();
	});

	it("should initialize with null lobby", () => {
		expect(useMultiplayerStore.getState().lobby).toBeNull();
	});

	it("should create lobby correctly", async () => {
		const code = await useMultiplayerStore
			.getState()
			.createLobby("user-1", "TestUser");

		expect(code).toBeTruthy();
		expect(useMultiplayerStore.getState().lobby?.id).toBe("lobby-1");
		expect(useMultiplayerStore.getState().isHost).toBe(true);
		expect(useMultiplayerStore.getState().playerId).toBe("user-1");
	});

	it("should reset state correctly", () => {
		useMultiplayerStore.getState().reset();
		expect(useMultiplayerStore.getState().lobby).toBeNull();
		expect(useMultiplayerStore.getState().participants).toEqual([]);
	});
});
