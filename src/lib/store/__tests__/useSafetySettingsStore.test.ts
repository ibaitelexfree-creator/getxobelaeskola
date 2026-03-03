import { beforeEach, describe, expect, it } from "vitest";
import { useSafetySettingsStore } from "../useSafetySettingsStore";

describe("useSafetySettingsStore", () => {
	beforeEach(() => {
		useSafetySettingsStore.getState().clearAlertHistory();
		useSafetySettingsStore.getState().setNotificationsEnabled(true);
		useSafetySettingsStore.getState().setSoundEnabled(false);
	});

	it("should update notifications settings", () => {
		useSafetySettingsStore.getState().setNotificationsEnabled(false);
		expect(useSafetySettingsStore.getState().notificationsEnabled).toBe(false);
	});

	it("should update sound settings", () => {
		useSafetySettingsStore.getState().setSoundEnabled(true);
		expect(useSafetySettingsStore.getState().soundEnabled).toBe(true);
	});

	it("should add to alert history and limit to 50", () => {
		for (let i = 0; i < 60; i++) {
			useSafetySettingsStore.getState().addAlertToHistory({
				title: `Alert ${i}`,
				message: "m",
				type: "warning",
			});
		}
		expect(useSafetySettingsStore.getState().alertHistory.length).toBe(50);
		expect(useSafetySettingsStore.getState().alertHistory[0].title).toBe(
			"Alert 59",
		);
	});

	it("should clear alert history", () => {
		useSafetySettingsStore
			.getState()
			.addAlertToHistory({ title: "T", message: "M", type: "critical" });
		useSafetySettingsStore.getState().clearAlertHistory();
		expect(useSafetySettingsStore.getState().alertHistory.length).toBe(0);
	});
});
