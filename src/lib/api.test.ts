import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiUrl, getApiBaseUrl } from "./api";

describe("src/lib/api.ts", () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
		vi.stubEnv("NEXT_PUBLIC_APP_URL", undefined); // clear by default
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	describe("getApiBaseUrl", () => {
		it("should return empty string during SSR (window is undefined)", () => {
			vi.stubGlobal("window", undefined);
			expect(getApiBaseUrl()).toBe("");
		});

		it("should return origin on localhost", () => {
			vi.stubGlobal("window", {
				location: {
					hostname: "localhost",
					protocol: "http:",
					origin: "http://localhost:3000",
				},
			});
			expect(getApiBaseUrl()).toBe("http://localhost:3000");
		});

		it("should return origin on 127.0.0.1", () => {
			vi.stubGlobal("window", {
				location: {
					hostname: "127.0.0.1",
					protocol: "http:",
					origin: "http://127.0.0.1:3000",
				},
			});
			expect(getApiBaseUrl()).toBe("http://127.0.0.1:3000");
		});

		it("should return NEXT_PUBLIC_APP_URL in Capacitor environment", () => {
			vi.stubGlobal("window", {
				location: {
					hostname: "localhost",
					protocol: "capacitor:",
					origin: "capacitor://localhost",
				},
			});
			vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://capacitor-app.com");
			expect(getApiBaseUrl()).toBe("https://capacitor-app.com");
		});

		it("should return NEXT_PUBLIC_APP_URL in File environment", () => {
			vi.stubGlobal("window", {
				location: {
					hostname: "localhost",
					protocol: "file:",
					origin: "file://",
				},
			});
			vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://file-app.com");
			expect(getApiBaseUrl()).toBe("https://file-app.com");
		});

		it("should return NEXT_PUBLIC_APP_URL in production browser if set", () => {
			vi.stubGlobal("window", {
				location: {
					hostname: "my-app.com",
					protocol: "https:",
					origin: "https://my-app.com",
				},
			});
			vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://api.my-app.com");
			expect(getApiBaseUrl()).toBe("https://api.my-app.com");
		});

		it("should fallback to default production URL if NEXT_PUBLIC_APP_URL is missing in production", () => {
			vi.stubGlobal("window", {
				location: {
					hostname: "my-app.com",
					protocol: "https:",
					origin: "https://my-app.com",
				},
			});
			// NEXT_PUBLIC_APP_URL is undefined by default in beforeEach
			expect(getApiBaseUrl()).toBe("https://getxobelaeskola.cloud");
		});

		it("should strip trailing slash from NEXT_PUBLIC_APP_URL", () => {
			vi.stubGlobal("window", {
				location: {
					hostname: "my-app.com",
					protocol: "https:",
					origin: "https://my-app.com",
				},
			});
			vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://api.my-app.com/");
			expect(getApiBaseUrl()).toBe("https://api.my-app.com");
		});
	});

	describe("apiUrl", () => {
		beforeEach(() => {
			// Setup a predictable base URL for apiUrl tests
			vi.stubGlobal("window", {
				location: {
					hostname: "my-app.com",
					protocol: "https:",
					origin: "https://my-app.com",
				},
			});
			vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://api.test.com");
		});

		it("should append normal path to base url", () => {
			expect(apiUrl("/users")).toBe("https://api.test.com/users");
		});

		it("should handle path without leading slash", () => {
			expect(apiUrl("users")).toBe("https://api.test.com/users");
		});

		it("should replace /api/academy/ with /api/ for non-academy routes", () => {
			expect(apiUrl("/api/academy/users")).toBe(
				"https://api.test.com/api/users",
			);
			expect(apiUrl("/api/academy/courses")).toBe(
				"https://api.test.com/api/courses",
			);
		});

		it("should NOT replace /api/academy/ for genuine academy routes", () => {
			expect(apiUrl("/api/academy/chatbot")).toBe(
				"https://api.test.com/api/academy/chatbot",
			);
			expect(apiUrl("/api/academy/leaderboard/top")).toBe(
				"https://api.test.com/api/academy/leaderboard/top",
			);
			expect(apiUrl("/api/academy/montessori")).toBe(
				"https://api.test.com/api/academy/montessori",
			);
			expect(apiUrl("/api/academy/repaso/quiz")).toBe(
				"https://api.test.com/api/academy/repaso/quiz",
			);
			expect(apiUrl("/api/academy/simulation/start")).toBe(
				"https://api.test.com/api/academy/simulation/start",
			);
		});

		it("should not modify paths that do not start with /api/academy/", () => {
			expect(apiUrl("/api/other/users")).toBe(
				"https://api.test.com/api/other/users",
			);
		});

		it("should return absolute URLs as-is", () => {
			const absUrl = "https://external.com/api/data";
			expect(apiUrl(absUrl)).toBe(absUrl);
		});
	});
});
