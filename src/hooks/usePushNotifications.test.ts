import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/client";
import { usePushNotifications } from "./usePushNotifications";

// Mocks
vi.mock("@capacitor/push-notifications", () => ({
	PushNotifications: {
		checkPermissions: vi.fn(),
		requestPermissions: vi.fn(),
		register: vi.fn(),
		addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
	},
}));

vi.mock("@capacitor/core", () => ({
	Capacitor: {
		isNativePlatform: vi.fn().mockReturnValue(false),
		getPlatform: vi.fn().mockReturnValue("web"),
	},
}));

vi.mock("@/lib/supabase/client", () => ({
	createClient: vi.fn(),
}));

describe("usePushNotifications", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with default state", () => {
		const { result } = renderHook(() => usePushNotifications());
		expect(result.current.permission).toBe("prompt");
		expect(result.current.isNative).toBe(false);
	});

	it("should check permissions on native platform", async () => {
		vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
		vi.mocked(PushNotifications.checkPermissions).mockResolvedValue({
			receive: "granted",
		} as any);

		const { result } = renderHook(() => usePushNotifications());

		await waitFor(() =>
			expect(PushNotifications.checkPermissions).toHaveBeenCalled(),
		);
		expect(result.current.permission).toBe("granted");
	});

	it("should handle error when checking permissions", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
		const mockError = new Error("Check failed");
		vi.mocked(PushNotifications.checkPermissions).mockRejectedValue(mockError);

		const { result } = renderHook(() => usePushNotifications());

		await waitFor(() => expect(result.current.error).toBe(mockError));
		expect(consoleSpy).toHaveBeenCalledWith(
			"Error checking push permissions:",
			mockError,
		);
		consoleSpy.mockRestore();
	});

	it("should request permissions and register if granted", async () => {
		vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
		vi.mocked(PushNotifications.checkPermissions).mockResolvedValue({
			receive: "prompt",
		} as any);
		vi.mocked(PushNotifications.requestPermissions).mockResolvedValue({
			receive: "granted",
		} as any);
		vi.mocked(PushNotifications.register).mockResolvedValue(undefined as any);

		const { result } = renderHook(() => usePushNotifications());

		await act(async () => {
			await result.current.requestPermissions();
		});

		expect(PushNotifications.requestPermissions).toHaveBeenCalled();
		expect(PushNotifications.register).toHaveBeenCalled();
		expect(result.current.permission).toBe("granted");
	});

	it("should handle error when requesting permissions", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
		vi.mocked(PushNotifications.checkPermissions).mockResolvedValue({
			receive: "prompt",
		} as any);
		const mockError = new Error("Request failed");
		vi.mocked(PushNotifications.requestPermissions).mockRejectedValue(
			mockError,
		);

		const { result } = renderHook(() => usePushNotifications());

		await act(async () => {
			await result.current.requestPermissions();
		});

		expect(result.current.error).toBe(mockError);
		expect(consoleSpy).toHaveBeenCalledWith(
			"Error requesting push permissions:",
			mockError,
		);
		consoleSpy.mockRestore();
	});

	it("should handle registration success and save token to Supabase", async () => {
		vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
		let registrationCallback: any;
		vi.mocked(PushNotifications.addListener).mockImplementation(((
			event: string,
			handler: any,
		) => {
			if (event === "registration") registrationCallback = handler;
			return Promise.resolve({ remove: vi.fn() });
		}) as any);

		const mockUpsert = vi.fn().mockReturnValue({ error: null });
		const mockSupabase = {
			auth: {
				getUser: vi
					.fn()
					.mockResolvedValue({ data: { user: { id: "user-123" } } }),
			},
			from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
		};
		vi.mocked(createClient).mockReturnValue(mockSupabase as any);

		renderHook(() => usePushNotifications());

		await waitFor(() => expect(registrationCallback).toBeDefined());

		await act(async () => {
			await registrationCallback({ value: "token-abc" });
		});

		expect(mockUpsert).toHaveBeenCalledWith(
			expect.objectContaining({ fcm_token: "token-abc", user_id: "user-123" }),
			expect.any(Object),
		);
	});

	it("should handle Supabase upsert error", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
		let registrationCallback: any;
		vi.mocked(PushNotifications.addListener).mockImplementation(((
			event: string,
			handler: any,
		) => {
			if (event === "registration") registrationCallback = handler;
			return Promise.resolve({ remove: vi.fn() });
		}) as any);

		const mockError = { message: "Database error" };
		const mockUpsert = vi.fn().mockReturnValue({ error: mockError });
		const mockSupabase = {
			auth: {
				getUser: vi
					.fn()
					.mockResolvedValue({ data: { user: { id: "user-123" } } }),
			},
			from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
		};
		vi.mocked(createClient).mockReturnValue(mockSupabase as any);

		renderHook(() => usePushNotifications());

		await waitFor(() => expect(registrationCallback).toBeDefined());

		await act(async () => {
			await registrationCallback({ value: "token-abc" });
		});

		expect(consoleSpy).toHaveBeenCalledWith(
			"Error saving FCM token:",
			mockError,
		);
		consoleSpy.mockRestore();
	});

	it("should handle registration error event", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
		let registrationErrorCallback: any;
		vi.mocked(PushNotifications.addListener).mockImplementation(((
			event: string,
			handler: any,
		) => {
			if (event === "registrationError") registrationErrorCallback = handler;
			return Promise.resolve({ remove: vi.fn() });
		}) as any);

		const { result } = renderHook(() => usePushNotifications());

		await waitFor(() => expect(registrationErrorCallback).toBeDefined());

		const mockError = { message: "Registration failed" };
		await act(async () => {
			registrationErrorCallback(mockError);
		});

		expect(result.current.error).toBe(mockError);
		expect(consoleSpy).toHaveBeenCalledWith(
			"Push Registration Error:",
			mockError,
		);
		consoleSpy.mockRestore();
	});
});
