import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllTopics } from "@/components/academy/montessori/data-adapter";
import { updateAbility } from "@/lib/academy/montessori-ml";
import { useMontessoriStore } from "../useMontessoriStore";

// Mock dependencies
vi.mock("@/components/academy/montessori/data-adapter", () => ({
	getAllTopics: vi.fn(),
}));

vi.mock("@/lib/academy/montessori-ml", () => ({
	updateAbility: vi.fn(),
}));

describe("useMontessoriStore", () => {
	beforeEach(() => {
		useMontessoriStore.getState().resetProgress();
		vi.clearAllMocks();
	});

	it("should have initial state", () => {
		const state = useMontessoriStore.getState();
		expect(state.ability).toBe(0.5);
		expect(state.history).toEqual([]);
	});

	it("should record interaction and update ability", () => {
		const mockTopic = { id: "topic-1", difficulty: 0.7 };
		(getAllTopics as any).mockReturnValue([mockTopic]);
		(updateAbility as any).mockReturnValue(0.6);

		useMontessoriStore.getState().recordInteraction("topic-1", "success");

		const state = useMontessoriStore.getState();
		expect(state.ability).toBe(0.6);
		expect(state.history.length).toBe(1);
		expect(state.history[0].topicId).toBe("topic-1");
		expect(state.history[0].result).toBe("success");
		expect(updateAbility).toHaveBeenCalledWith(0.5, 0.7, "success");
	});

	it("should NOT update if topic is not found", () => {
		(getAllTopics as any).mockReturnValue([]);

		useMontessoriStore.getState().recordInteraction("invalid-id", "success");

		const state = useMontessoriStore.getState();
		expect(state.ability).toBe(0.5);
		expect(state.history.length).toBe(0);
		expect(updateAbility).not.toHaveBeenCalled();
	});
});
