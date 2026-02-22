import { describe, expect, it } from "vitest";
import {
	getTideLevel,
	getTidePredictions,
	getTideState,
} from "./puertos-del-estado";

describe("Puertos del Estado Simulation", () => {
	it("should return tide predictions for a given day", () => {
		const date = new Date("2024-01-01T12:00:00Z");
		const predictions = getTidePredictions(date);

		expect(predictions.length).toBeGreaterThan(0);
		predictions.forEach((p) => {
			expect(p).toHaveProperty("time");
			expect(p).toHaveProperty("height");
			expect(p).toHaveProperty("type");
		});
	});

	it("should calculate tide level within reasonable range", () => {
		const date = new Date();
		const level = getTideLevel(date);
		// Mean is 2.5, Amplitude is 1.5. Range [1.0, 4.0]
		expect(level).toBeGreaterThanOrEqual(1.0);
		expect(level).toBeLessThanOrEqual(4.0);
	});

	it("should determine tide state", () => {
		const date = new Date();
		const state = getTideState(date);

		expect(state).toHaveProperty("height");
		expect(state).toHaveProperty("trend");
		expect(state).toHaveProperty("percentage");
		expect(state.percentage).toBeGreaterThanOrEqual(0);
		expect(state.percentage).toBeLessThanOrEqual(1);
	});
});
