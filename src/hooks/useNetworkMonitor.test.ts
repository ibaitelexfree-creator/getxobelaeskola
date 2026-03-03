import { type ConnectionStatus, Network } from "@capacitor/network";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNetworkMonitor } from "./useNetworkMonitor";

// Mock Capacitor Network
vi.mock("@capacitor/network", () => ({
	Network: {
		getStatus: vi.fn(),
		addListener: vi.fn(),
	},
}));

describe("useNetworkMonitor", () => {
	const mockOnWifiDisconnect = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should setup network listener on mount", async () => {
		vi.mocked(Network.getStatus).mockResolvedValue({
			connected: true,
			connectionType: "wifi",
		} as ConnectionStatus);
		vi.mocked(Network.addListener).mockResolvedValue({
			remove: vi.fn(),
		} as any);

		renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

		await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());
		expect(Network.addListener).toHaveBeenCalledWith(
			"networkStatusChange",
			expect.any(Function),
		);
	});

	it("should trigger callback when transitioning from wifi to cellular", async () => {
		let statusChangeHandler: (status: ConnectionStatus) => void = () => {};
		vi.mocked(Network.getStatus).mockResolvedValue({
			connected: true,
			connectionType: "wifi",
		} as ConnectionStatus);
		vi.mocked(Network.addListener).mockImplementation(
			(_event, handler: any) => {
				statusChangeHandler = handler;
				return Promise.resolve({ remove: vi.fn() } as any);
			},
		);

		renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

		await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());

		// Trigger change
		act(() => {
			statusChangeHandler({
				connected: true,
				connectionType: "cellular",
			} as ConnectionStatus);
		});

		expect(mockOnWifiDisconnect).toHaveBeenCalled();
	});

	it("should NOT trigger callback when transitioning from cellular to wifi", async () => {
		let statusChangeHandler: (status: ConnectionStatus) => void = () => {};
		vi.mocked(Network.getStatus).mockResolvedValue({
			connected: true,
			connectionType: "cellular",
		} as ConnectionStatus);
		vi.mocked(Network.addListener).mockImplementation(
			(_event, handler: any) => {
				statusChangeHandler = handler;
				return Promise.resolve({ remove: vi.fn() } as any);
			},
		);

		renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

		await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());

		act(() => {
			statusChangeHandler({
				connected: true,
				connectionType: "wifi",
			} as ConnectionStatus);
		});

		expect(mockOnWifiDisconnect).not.toHaveBeenCalled();
	});

	it("should handle errors when setting up network listener", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const error = new Error("Network error");
		vi.mocked(Network.getStatus).mockRejectedValue(error);

		renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

		await waitFor(() =>
			expect(consoleSpy).toHaveBeenCalledWith(
				"Error setting up network listener:",
				error,
			),
		);

		consoleSpy.mockRestore();
	});
});
