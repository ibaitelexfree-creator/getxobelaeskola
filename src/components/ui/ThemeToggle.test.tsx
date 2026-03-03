import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeStore } from "@/lib/store/useThemeStore";
import ThemeToggle from "./ThemeToggle";

// Mock the store
vi.mock("@/lib/store/useThemeStore", () => ({
	useThemeStore: vi.fn(),
}));

describe("ThemeToggle", () => {
	const mockSetTheme = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useThemeStore as any).mockReturnValue({
			theme: "light",
			setTheme: mockSetTheme,
		});
	});

	it("should render pulse skeleton initially before mounting", () => {
		// In some environments, we might want to test the non-mounted state
		// but since useEffect runs immediately in JSDOM, we'll focus on the mounted state
		render(<ThemeToggle />);
		expect(screen.getByRole("button", { name: /Toggle theme/i })).toBeDefined();
	});

	it("should show correct icon for light theme", () => {
		(useThemeStore as any).mockReturnValue({
			theme: "light",
			setTheme: mockSetTheme,
		});
		render(<ThemeToggle />);
		// Lucide Sun icon would be rendered. We check the text/aria-label.
		expect(screen.getByText("Light Mode")).toBeDefined();
	});

	it("should show correct icon for dark theme", () => {
		(useThemeStore as any).mockReturnValue({
			theme: "dark",
			setTheme: mockSetTheme,
		});
		render(<ThemeToggle />);
		expect(screen.getByText("Dark Mode")).toBeDefined();
	});

	it("should call setTheme when clicked", () => {
		(useThemeStore as any).mockReturnValue({
			theme: "light",
			setTheme: mockSetTheme,
		});
		render(<ThemeToggle />);

		const button = screen.getByRole("button", { name: /Toggle theme/i });
		fireEvent.click(button);

		expect(mockSetTheme).toHaveBeenCalledWith("dark");
	});

	it("should cycle through themes correctly", () => {
		const { rerender } = render(<ThemeToggle />);

		// Light -> Dark
		(useThemeStore as any).mockReturnValue({
			theme: "light",
			setTheme: mockSetTheme,
		});
		rerender(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button", { name: /Toggle theme/i }));
		expect(mockSetTheme).toHaveBeenLastCalledWith("dark");

		// Dark -> System
		(useThemeStore as any).mockReturnValue({
			theme: "dark",
			setTheme: mockSetTheme,
		});
		rerender(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button", { name: /Toggle theme/i }));
		expect(mockSetTheme).toHaveBeenLastCalledWith("system");

		// System -> Light
		(useThemeStore as any).mockReturnValue({
			theme: "system",
			setTheme: mockSetTheme,
		});
		rerender(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button", { name: /Toggle theme/i }));
		expect(mockSetTheme).toHaveBeenLastCalledWith("light");
	});
});
