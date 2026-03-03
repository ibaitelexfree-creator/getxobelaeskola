import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationStore } from "@/lib/store/useNotificationStore";
import { createClient } from "@/lib/supabase/client";
import { useSmartNotifications } from "./useSmartNotifications";

// Mocks
vi.mock("@capacitor/local-notifications", () => ({
	LocalNotifications: {
		checkPermissions: vi.fn(),
		requestPermissions: vi.fn(),
		schedule: vi.fn(),
	},
}));

vi.mock("@capacitor/core", () => ({
	Capacitor: {
		isNativePlatform: vi.fn().mockReturnValue(false),
	},
}));

vi.mock("@/lib/supabase/client", () => ({
	createClient: vi.fn(),
}));

vi.mock("@/lib/store/useNotificationStore", () => ({
	useNotificationStore: vi.fn(),
}));

describe("useSmartNotifications", () => {
	let mockAddNotification: any;
	let mockSupabase: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockAddNotification = vi.fn();
		(useNotificationStore as any).mockReturnValue({
			addNotification: mockAddNotification,
		});

		mockSupabase = {
			from: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			gte: vi.fn().mockReturnThis(),
			gt: vi.fn().mockReturnThis(),
			single: vi.fn().mockReturnThis(),
			channel: vi.fn().mockReturnThis(),
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn().mockReturnThis(),
			removeChannel: vi.fn(),
			// Mock then to make it thenable if needed, or just return data in tests
		};
		(createClient as any).mockReturnValue(mockSupabase);
	});

	it("should request permissions on native platform", async () => {
		(Capacitor.isNativePlatform as any).mockReturnValue(true);
		(LocalNotifications.checkPermissions as any).mockResolvedValue({
			display: "prompt",
		});

		const { result } = renderHook(() => useSmartNotifications());

		await act(async () => {
			await result.current.requestLocalPermissions();
		});

		expect(LocalNotifications.requestPermissions).toHaveBeenCalled();
	});

	it("should schedule streak reminder based on study habits", async () => {
		(Capacitor.isNativePlatform as any).mockReturnValue(true);
		// Use local time strings to avoid timezone shifts in tests
		const mockAttempts = [
			{ created_at: "2023-01-01T10:00:00" },
			{ created_at: "2023-01-02T10:05:00" },
			{ created_at: "2023-01-03T18:00:00" },
		];
		mockSupabase.gte.mockResolvedValue({ data: mockAttempts });

		const { result } = renderHook(() => useSmartNotifications());

		await act(async () => {
			await result.current.scheduleStreakReminder("user-123");
		});

		expect(LocalNotifications.schedule).toHaveBeenCalledWith(
			expect.objectContaining({
				notifications: [
					expect.objectContaining({
						id: 1001,
						schedule: expect.objectContaining({
							on: expect.objectContaining({ hour: 10 }),
						}),
					}),
				],
			}),
		);
	});

	it("should schedule exam reminders", async () => {
		(Capacitor.isNativePlatform as any).mockReturnValue(true);
		// Set exam 2 days in the future so reminder (24h before) is surely in the future
		const examDate = new Date();
		examDate.setDate(examDate.getDate() + 2);
		examDate.setHours(10, 0, 0, 0);

		const mockAttendance = [
			{
				sesion_id: "ses-1",
				sesiones: {
					fecha_inicio: examDate.toISOString(),
					observaciones: "Examen de navegación",
				},
			},
		];
		mockSupabase.gt.mockResolvedValue({ data: mockAttendance, error: null });

		const { result } = renderHook(() => useSmartNotifications());

		await act(async () => {
			await result.current.scheduleExamReminders("user-123");
		});

		expect(LocalNotifications.schedule).toHaveBeenCalled();
		const call = (LocalNotifications.schedule as any).mock.calls[0][0];
		expect(call.notifications[0].title).toBe("📅 ¡Examen Próximo!");
	});

	it("should handle module completion in Web mode (in-app toast)", async () => {
		(Capacitor.isNativePlatform as any).mockReturnValue(false);
		let postgresChangesCallback: any;
		mockSupabase.on.mockImplementation((event, filter, callback) => {
			postgresChangesCallback = callback;
			return mockSupabase;
		});

		const { result } = renderHook(() => useSmartNotifications());
		result.current.listenToModuleCompletion("user-123");

		// Mock module data fetch
		mockSupabase.single.mockResolvedValue({
			data: { nombre_es: "Meteorología" },
		});

		await act(async () => {
			await postgresChangesCallback({
				new: {
					estado: "completado",
					tipo_entidad: "modulo",
					entidad_id: "mod-1",
				},
			});
		});

		expect(mockAddNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "achievement",
				title: "¡Módulo Completado!",
				message: "Has completado Meteorología.",
			}),
		);
	});
});
