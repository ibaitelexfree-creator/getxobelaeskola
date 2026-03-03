import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import CheckpointQuestion from "./CheckpointQuestion";

describe("CheckpointQuestion", () => {
	it("renders question and options", () => {
		render(
			<CheckpointQuestion
				question="Test Q"
				options={["Option A", "Option B"]}
				correctOptionIndex={0}
				onCorrect={() => {}}
			/>,
		);
		expect(screen.getByText("Test Q")).toBeInTheDocument();
		expect(screen.getByText("Option A")).toBeInTheDocument();
		expect(screen.getByText("Option B")).toBeInTheDocument();
	});

	it("handles correct answer", () => {
		const onCorrect = vi.fn();
		vi.useFakeTimers();
		render(
			<CheckpointQuestion
				question="Test Q"
				options={["Option A", "Option B"]}
				correctOptionIndex={0}
				onCorrect={onCorrect}
			/>,
		);

		fireEvent.click(screen.getByText("Option A"));
		fireEvent.click(screen.getByText("Responder"));

		// Should show correct feedback immediately
		expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();

		// Fast-forward time
		act(() => {
			vi.advanceTimersByTime(1500);
		});

		expect(onCorrect).toHaveBeenCalled();
		vi.useRealTimers();
	});

	it("handles incorrect answer", () => {
		const onIncorrect = vi.fn();
		render(
			<CheckpointQuestion
				question="Test Q"
				options={["Option A", "Option B"]}
				correctOptionIndex={0}
				onCorrect={() => {}}
				onIncorrect={onIncorrect}
			/>,
		);

		fireEvent.click(screen.getByText("Option B"));
		fireEvent.click(screen.getByText("Responder"));

		expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
		expect(onIncorrect).toHaveBeenCalled();
	});
});
