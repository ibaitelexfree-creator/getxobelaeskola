import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedCallback } from "../useDebouncedCallback";

describe("useDebouncedCallback hook", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should call debounced function after delay", () => {
		const mockCallback = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback(mockCallback, 500),
		);

		result.current("test");
		expect(mockCallback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(499);
		expect(mockCallback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(mockCallback).toHaveBeenCalledWith("test");
	});

	it("should reset timer if called multiple times", () => {
		const mockCallback = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback(mockCallback, 500),
		);

		result.current();
		vi.advanceTimersByTime(300);
		result.current();
		vi.advanceTimersByTime(300);

		expect(mockCallback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(200);
		expect(mockCallback).toHaveBeenCalled();
	});
});
