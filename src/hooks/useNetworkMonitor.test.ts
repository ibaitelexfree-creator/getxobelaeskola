import { Network } from "@capacitor/network";
import { renderHook, waitFor } from "@testing-library/react";
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
		(Network.getStatus as any).mockResolvedValue({
			connected: true,
			connectionType: "wifi",
		});
		(Network.addListener as any).mockResolvedValue({ remove: vi.fn() });

		renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

		await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());
		expect(Network.addListener).toHaveBeenCalledWith(
			"networkStatusChange",
			expect.any(Function),
		);
	});

	it("should trigger callback when transitioning from wifi to cellular", async () => {
		let statusChangeHandler: (status: any) => void = () => {};
		(Network.getStatus as any).mockResolvedValue({
			connected: true,
			connectionType: "wifi",
		});
		(Network.addListener as any).mockImplementation((event, handler) => {
			statusChangeHandler = handler;
			return { remove: vi.fn() };
		});

		renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

		await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());

		// Trigger change
		act(() => {
			statusChangeHandler({ connected: true, connectionType: "cellular" });
		});

		expect(mockOnWifiDisconnect).toHaveBeenCalled();
	});

	it("should NOT trigger callback when transitioning from cellular to wifi", async () => {
		let statusChangeHandler: (status: any) => void = () => {};
		(Network.getStatus as any).mockResolvedValue({
			connected: true,
			connectionType: "cellular",
		});
		(Network.addListener as any).mockImplementation((event, handler) => {
			statusChangeHandler = handler;
			return { remove: vi.fn() };
		});

		renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

		await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());

		act(() => {
			statusChangeHandler({ connected: true, connectionType: "wifi" });
		});

		expect(mockOnWifiDisconnect).not.toHaveBeenCalled();
	});
});

// Import act from react explicitly for hooks test
import { act } from "react";
