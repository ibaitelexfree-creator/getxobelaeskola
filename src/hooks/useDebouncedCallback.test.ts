import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedCallback } from "./useDebouncedCallback";

describe("useDebouncedCallback", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("shoulddebounce the callback execution", () => {
		const mockCallback = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback(mockCallback, 500),
		);

		act(() => {
			result.current("arg1");
			result.current("arg2");
		});

		expect(mockCallback).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(501);
		});

		expect(mockCallback).toHaveBeenCalledTimes(1);
		expect(mockCallback).toHaveBeenCalledWith("arg2");
	});

	it("should clear timeout on unmount", () => {
		const mockCallback = vi.fn();
		const { result, unmount } = renderHook(() =>
			useDebouncedCallback(mockCallback, 500),
		);

		act(() => {
			result.current();
		});

		unmount();

		act(() => {
			vi.advanceTimersByTime(501);
		});

		expect(mockCallback).not.toHaveBeenCalled();
	});
});
