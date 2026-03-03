import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "./AchievementEngine";

describe("AchievementEngine", () => {
	it('unlocks "primeros_pasos" for any successful completion', () => {
		const context = { missionType: "any", score: 0.5 };
		const unlocked = evaluateAchievements(context);
		expect(unlocked).toContain("primeros_pasos");
	});

	it('unlocks "senor_de_los_vientos" for high score in tactical mission', () => {
		const context = { missionType: "tactical", score: 0.85 };
		const unlocked = evaluateAchievements(context);
		expect(unlocked).toContain("senor_de_los_vientos");
		expect(unlocked).toContain("primeros_pasos");
	});

	it('does NOT unlock "senor_de_los_vientos" for low score', () => {
		const context = { missionType: "tactical", score: 0.7 };
		const unlocked = evaluateAchievements(context);
		expect(unlocked).not.toContain("senor_de_los_vientos");
	});

	it('unlocks "maestro_de_cabos" for perfect knot mission', () => {
		const context = { missionType: "knots", score: 1.0 };
		const unlocked = evaluateAchievements(context);
		expect(unlocked).toContain("maestro_de_cabos");
	});

	it('unlocks "velocidad_luz" for fast completion', () => {
		const context = { missionType: "any", score: 0.6, timeSeconds: 45 };
		const unlocked = evaluateAchievements(context);
		expect(unlocked).toContain("velocidad_luz");
	});

	it("returns empty array for zero score", () => {
		const context = { missionType: "any", score: 0 };
		const unlocked = evaluateAchievements(context);
		expect(unlocked).toEqual([]);
	});
});
