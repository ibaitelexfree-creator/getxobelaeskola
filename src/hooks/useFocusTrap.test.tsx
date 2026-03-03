import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

function TestComponent({ active }: { active: boolean }) {
	const ref = useFocusTrap(active);
	return (
		<div ref={ref}>
			<button data-testid="b1">Button 1</button>
			<button data-testid="b2">Button 2</button>
		</div>
	);
}

describe("useFocusTrap Component Integration", () => {
	it("should set initial focus to the first element", () => {
		render(<TestComponent active={true} />);
		const b1 = screen.getByTestId("b1");
		expect(document.activeElement).toBe(b1);
	});

	it("should cycle focus on Tab", () => {
		render(<TestComponent active={true} />);
		const b1 = screen.getByTestId("b1");
		const b2 = screen.getByTestId("b2");

		// Initial focus
		expect(document.activeElement).toBe(b1);

		// Tab on last element should ground back to first
		act(() => {
			b2.focus();
			const tabEvent = new KeyboardEvent("keydown", {
				key: "Tab",
				bubbles: true,
			});
			window.dispatchEvent(tabEvent);
		});
		expect(document.activeElement).toBe(b1);
	});

	it("should reverse focus on Shift+Tab", () => {
		render(<TestComponent active={true} />);
		const _b1 = screen.getByTestId("b1");
		const b2 = screen.getByTestId("b2");

		act(() => {
			const shiftTab = new KeyboardEvent("keydown", {
				key: "Tab",
				shiftKey: true,
				bubbles: true,
			});
			window.dispatchEvent(shiftTab);
		});
		expect(document.activeElement).toBe(b2);
	});
});
