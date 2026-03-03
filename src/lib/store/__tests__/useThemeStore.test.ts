import { beforeEach, describe, expect, it } from "vitest";
import { useThemeStore } from "../useThemeStore";

describe("useThemeStore", () => {
	beforeEach(() => {
		useThemeStore.getState().setTheme("system");
	});

	it("should update theme", () => {
		useThemeStore.getState().setTheme("dark");
		expect(useThemeStore.getState().theme).toBe("dark");
	});
});
