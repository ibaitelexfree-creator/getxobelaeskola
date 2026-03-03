import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationStore } from "../useNotificationStore";

describe("useNotificationStore", () => {
	beforeEach(() => {
		useNotificationStore.getState().clearNotifications();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should add a notification", () => {
		useNotificationStore.getState().addNotification({
			type: "info",
			title: "Test",
			message: "Hello",
		});

		expect(useNotificationStore.getState().notifications.length).toBe(1);
		expect(useNotificationStore.getState().notifications[0].title).toBe("Test");
	});

	it("should remove a notification by id", () => {
		useNotificationStore.getState().addNotification({
			type: "info",
			title: "Test",
			message: "Hello",
		});

		const id = useNotificationStore.getState().notifications[0].id;
		useNotificationStore.getState().removeNotification(id);
		expect(useNotificationStore.getState().notifications.length).toBe(0);
	});

	it("should auto-remove notification after duration", () => {
		useNotificationStore.getState().addNotification({
			type: "info",
			title: "Auto",
			message: "Bye",
			duration: 1000,
		});

		expect(useNotificationStore.getState().notifications.length).toBe(1);
		vi.advanceTimersByTime(1001);
		expect(useNotificationStore.getState().notifications.length).toBe(0);
	});

	it("should clear all notifications", () => {
		useNotificationStore
			.getState()
			.addNotification({ type: "info", title: "1", message: "m" });
		useNotificationStore
			.getState()
			.addNotification({ type: "info", title: "2", message: "m" });
		useNotificationStore.getState().clearNotifications();
		expect(useNotificationStore.getState().notifications.length).toBe(0);
	});
});
