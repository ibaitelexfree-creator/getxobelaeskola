import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeStore } from "@/lib/store/useThemeStore";
import ThemeToggle from "../ThemeToggle";

vi.mock("@/lib/store/useThemeStore", () => ({
	useThemeStore: vi.fn(),
}));

describe("ThemeToggle component", () => {
	const mockSetTheme = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useThemeStore as any).mockReturnValue({
			theme: "light",
			setTheme: mockSetTheme,
		});
	});

	it("should toggle from light to dark", () => {
		render(<ThemeToggle />);

		const button = screen.getByRole("button", { name: /toggle theme/i });
		fireEvent.click(button);

		expect(mockSetTheme).toHaveBeenCalledWith("dark");
	});

	it("should toggle from dark to system", () => {
		(useThemeStore as any).mockReturnValue({
			theme: "dark",
			setTheme: mockSetTheme,
		});

		render(<ThemeToggle />);

		const button = screen.getByRole("button", { name: /toggle theme/i });
		fireEvent.click(button);

		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});
});
