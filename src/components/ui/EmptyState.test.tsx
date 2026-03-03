import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EmptyState from "./EmptyState";

// Mock framer-motion to simplify testing
vi.mock("framer-motion", () => ({
	motion: {
		div: ({ children, className }: any) => (
			<div className={className}>{children}</div>
		),
		span: ({ children, className }: any) => (
			<span className={className}>{children}</span>
		),
		p: ({ children, className }: any) => (
			<p className={className}>{children}</p>
		),
	},
	AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("EmptyState", () => {
	it("should render title and subtitle", () => {
		render(
			<EmptyState
				title="No items found"
				subtitle="Try adjusting your filters"
				actionLabel="Reset"
				actionHref="/"
			/>,
		);

		expect(screen.getByText("No items found")).toBeDefined();
		expect(screen.getByText("Try adjusting your filters")).toBeDefined();
	});

	it("should render correct action button", () => {
		render(
			<EmptyState
				title="Test"
				subtitle="Test"
				actionLabel="Go Home"
				actionHref="/home"
			/>,
		);

		const link = screen.getByRole("link", { name: /Go Home/i });
		expect(link.getAttribute("href")).toBe("/home");
	});

	it("should show custom icon", () => {
		render(
			<EmptyState
				icon="⛵"
				title="Test"
				subtitle="Test"
				actionLabel="Test"
				actionHref="/"
			/>,
		);

		expect(screen.getByText("⛵")).toBeDefined();
	});
});
