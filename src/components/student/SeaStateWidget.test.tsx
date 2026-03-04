import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SeaStateWidget from "./SeaStateWidget";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	},
}));

describe("SeaStateWidget", () => {
	const mockData = {
		wave_height: 1.5,
		wave_period: 8,
		water_temp: 18,
		wind_speed: 12,
		wind_direction: 45,
		timestamp: new Date().toISOString(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	it("should show loading state initially", async () => {
		(global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

		render(<SeaStateWidget />);

		// The default title is "Estado del Mar"
		expect(screen.getByText(/Estado del Mar/i)).toBeDefined();
	});

	it("should render sea state data when fetch is successful", async () => {
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockData,
		});

		render(<SeaStateWidget />);

		await waitFor(() => {
			expect(screen.getByText("1.5")).toBeDefined();
			expect(screen.getByText("8")).toBeDefined();
			expect(screen.getByText("18")).toBeDefined();
			expect(screen.getByText("12")).toBeDefined();
		});
	});

	it("should return null when API returns an error (res.ok is false)", async () => {
		(global.fetch as any).mockResolvedValue({
			ok: false,
		});

		const { container } = render(<SeaStateWidget />);

		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});
	});

	it("should return null when fetch throws an exception", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		(global.fetch as any).mockRejectedValue(new Error("Network error"));

		const { container } = render(<SeaStateWidget />);

		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("should refresh data when refresh button is clicked", async () => {
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockData,
		});

		render(<SeaStateWidget />);

		await waitFor(() => screen.getByText("1.5"));

		const refreshButton = screen.getByRole("button");

		// Mock a different value for the refresh
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({ ...mockData, wave_height: 2.0 }),
		});

		fireEvent.click(refreshButton);

		await waitFor(() => {
			expect(screen.getByText("2")).toBeDefined();
		});

		expect(global.fetch).toHaveBeenCalledTimes(2);
	});
});
