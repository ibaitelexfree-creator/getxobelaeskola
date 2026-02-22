import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VideoWithCheckpoints from "./VideoWithCheckpoints";

// Mock YT Player
const mockPlayer = {
	pauseVideo: vi.fn(),
	playVideo: vi.fn(),
	getCurrentTime: vi.fn(),
	seekTo: vi.fn(),
	destroy: vi.fn(),
	getDuration: vi.fn().mockReturnValue(100),
};

// Use a regular function so 'new' works
const MockPlayerConstructor = vi.fn((id, config) => mockPlayer);

const mockYT = {
	Player: MockPlayerConstructor,
	PlayerState: {
		PLAYING: 1,
		ENDED: 0,
		PAUSED: 2,
	},
};

describe("VideoWithCheckpoints", () => {
	beforeEach(() => {
		window.YT = mockYT;
		// Mock setInterval
		vi.useFakeTimers();
		// Reset mocks
		mockPlayer.pauseVideo.mockClear();
		mockPlayer.playVideo.mockClear();
		mockPlayer.getCurrentTime.mockClear();
		MockPlayerConstructor.mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it("initializes YouTube player", () => {
		render(<VideoWithCheckpoints videoUrl="test-id" checkpoints={[]} />);

		expect(window.YT.Player).toHaveBeenCalledWith(
			"youtube-player",
			expect.any(Object),
		);
	});

	it("pauses at checkpoint and resumes after correct answer", () => {
		const checkpoints = [
			{
				time: 10,
				question: "Q1",
				options: ["Option A", "Option B"],
				correctOptionIndex: 0,
			},
		];

		render(
			<VideoWithCheckpoints videoUrl="test-id" checkpoints={checkpoints} />,
		);

		// Get the onStateChange handler passed to YT.Player
		const playerConfig = MockPlayerConstructor.mock.calls[0][1];
		const onStateChange = playerConfig.events.onStateChange;

		// Simulate playing
		act(() => {
			onStateChange({ data: window.YT.PlayerState.PLAYING });
		});

		// Simulate time passing close to checkpoint
		mockPlayer.getCurrentTime.mockReturnValue(10.1);

		// Advance timers to trigger interval check
		act(() => {
			vi.advanceTimersByTime(600);
		});

		expect(mockPlayer.pauseVideo).toHaveBeenCalled();
		expect(screen.getByText("Q1")).toBeInTheDocument();

		// Answer correctly
		fireEvent.click(screen.getByText("Option A"));
		fireEvent.click(screen.getByText("Responder"));

		// Advance timer for success message
		act(() => {
			vi.advanceTimersByTime(2000);
		});

		// Should resume video
		expect(mockPlayer.playVideo).toHaveBeenCalled();

		// Should hide question
		expect(screen.queryByText("Responder")).not.toBeInTheDocument();
	});
});
