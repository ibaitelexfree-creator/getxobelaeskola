import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WeatherData } from "@/lib/academy/weather-service";
import { WeatherService } from "@/lib/academy/weather-service";
import { useWindSpeed } from "./useWindSpeed";

// Mock WeatherService
vi.mock("@/lib/academy/weather-service", () => ({
	WeatherService: {
		getGetxoWeather: vi.fn(),
	},
}));

const mockWeatherData = (overrides: Partial<WeatherData>): WeatherData => ({
	windSpeed: 0,
	windDirection: 0,
	windGust: 0,
	tideHeight: 0,
	tideStatus: "stable",
	nextTides: [],
	temperature: 0,
	pressure: 1013,
	condition: "Clear",
	visibility: 10,
	isLive: true,
	...overrides,
});

describe("useWindSpeed", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch wind speed on mount", async () => {
		vi.mocked(WeatherService.getGetxoWeather).mockResolvedValue(
			mockWeatherData({ windSpeed: 10 }),
		);

		const { result } = renderHook(() => useWindSpeed());

		await waitFor(() => expect(result.current).toBe(10));
		expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);
	});

	it("should handle fetch errors gracefully and log to console", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const error = new Error("Fatal error");
		vi.mocked(WeatherService.getGetxoWeather).mockRejectedValue(error);

		const { result } = renderHook(() => useWindSpeed());

		await waitFor(() =>
			expect(WeatherService.getGetxoWeather).toHaveBeenCalled(),
		);
		expect(result.current).toBe(0);
		expect(consoleSpy).toHaveBeenCalledWith(
			"Weather fetch error in useWindSpeed",
			error,
		);

		consoleSpy.mockRestore();
	});

	it("should not update wind speed if data is undefined", async () => {
		// We simulate a case where windSpeed might be missing from the raw data
		// even though our interface says it's required, the implementation checks for it.
		vi.mocked(WeatherService.getGetxoWeather).mockResolvedValue({
			windSpeed: undefined,
		} as unknown as WeatherData);

		const { result } = renderHook(() => useWindSpeed());

		await waitFor(() =>
			expect(WeatherService.getGetxoWeather).toHaveBeenCalled(),
		);
		expect(result.current).toBe(0);
	});

	describe("with fake timers", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("should refresh wind speed based on interval", async () => {
			const interval = 1000;
			vi.mocked(WeatherService.getGetxoWeather)
				.mockResolvedValueOnce(mockWeatherData({ windSpeed: 10 }))
				.mockResolvedValueOnce(mockWeatherData({ windSpeed: 15 }));

			const { result } = renderHook(() => useWindSpeed(interval));

			// Initial fetch starts immediately in useEffect.
			await act(async () => {
				await vi.advanceTimersByTimeAsync(0);
			});

			expect(result.current).toBe(10);
			expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);

			// Advance time to trigger interval
			await act(async () => {
				await vi.advanceTimersByTimeAsync(interval);
			});

			expect(result.current).toBe(15);
			expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(2);
		});
	});
});
