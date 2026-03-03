import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/client";
import { useRegattaSocket } from "./useRegattaSocket";

// Mocks
vi.mock("@/lib/supabase/client", () => ({
	createClient: vi.fn(),
}));

describe("useRegattaSocket", () => {
	let mockChannel: any;
	let mockOn: any;
	let mockSubscribe: any;
	let mockSend: any;
	let mockRemoveChannel: any;

	beforeEach(() => {
		vi.clearAllMocks();

		mockSend = vi.fn().mockResolvedValue({ error: null });
		mockSubscribe = vi.fn().mockImplementation((cb) => {
			if (typeof cb === "function") cb("SUBSCRIBED");
			return { unsubscribe: vi.fn() };
		});

		mockOn = vi.fn().mockImplementation(() => ({
			on: mockOn,
			subscribe: mockSubscribe,
			send: mockSend,
		}));

		mockChannel = {
			on: mockOn,
			subscribe: mockSubscribe,
			send: mockSend,
		};

		mockRemoveChannel = vi.fn();

		(createClient as any).mockReturnValue({
			channel: vi.fn().mockReturnValue(mockChannel),
			removeChannel: mockRemoveChannel,
		});
	});

	it("should initialize and subscribe to channel", () => {
		const { result } = renderHook(() =>
			useRegattaSocket("match-123", "user-456", "Tester"),
		);

		expect(result.current.isConnected).toBe(true);
		expect(createClient().channel).toHaveBeenCalledWith(
			"regatta:match-123",
			expect.any(Object),
		);
	});

	it("should handle incoming broadcast updates", async () => {
		let broadcastHandler: any;
		mockOn.mockImplementation((event: string, config: any, handler: any) => {
			if (config.event === "pos") broadcastHandler = handler;
			return mockChannel;
		});

		const { result } = renderHook(() =>
			useRegattaSocket("match-123", "user-456", "Tester"),
		);

		const payload = {
			userId: "opponent-789",
			username: "Opponent",
			position: { x: 10, y: 0, z: 20 },
			heading: 45,
			heel: 5,
			sailAngle: 10,
			speed: 5,
		};

		act(() => {
			broadcastHandler({ payload });
		});

		expect(result.current.opponents).toHaveLength(1);
		expect(result.current.opponents[0].username).toBe("Opponent");
	});

	it("should broadcast state with rate limiting", () => {
		const { result } = renderHook(() =>
			useRegattaSocket("match-123", "user-456", "Tester"),
		);

		const boatState = {
			boatState: {
				position: { x: 0, y: 0, z: 0 },
				heading: 0,
				heel: 0,
				speed: 0,
			},
			sailAngle: 0,
		};

		act(() => {
			result.current.broadcastState(boatState);
			result.current.broadcastState(boatState); // Immediate second call
		});

		// Should only be called once due to 50ms rate limit (20Hz)
		expect(mockSend).toHaveBeenCalledTimes(1);
	});

	it("should cleanup on unmount", () => {
		const { unmount } = renderHook(() =>
			useRegattaSocket("match-123", "user-456", "Tester"),
		);
		unmount();
		expect(mockRemoveChannel).toHaveBeenCalled();
	});
});
