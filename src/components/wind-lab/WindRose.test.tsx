import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WindRose from "./WindRose";

// Mock next-intl
vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			title: "Interactive Rose",
			drag_instruction: "Drag instruction",
			close_hauled: "Close Hauled",
			optimal_angle: "Optimal Angle",
			vmg: "VMG",
			boat_heading: "Boat Heading",
			twa: "TWA",
			speed: "Speed",
		};
		return translations[key] || key;
	},
}));

describe("WindRose", () => {
	it("renders correctly", () => {
		render(<WindRose />);
		expect(screen.getByText("Interactive Rose")).toBeDefined();
		expect(screen.getByText("Drag instruction")).toBeDefined();
		expect(screen.getByText("TWA")).toBeDefined();
		expect(screen.getByText("000° (N)")).toBeDefined();
	});

	it("displays initial wind angle correctly", () => {
		render(<WindRose initialAngle={90} />);
		expect(screen.getByText("90°")).toBeDefined();
	});
});
