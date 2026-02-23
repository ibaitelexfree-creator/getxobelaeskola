import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import InteractiveVideo from './InteractiveVideo';
import { VideoCheckpoint, QuestionData } from './types';

// Mock AccessibleModal
vi.mock('@/components/shared/AccessibleModal', () => ({
    default: ({ isOpen, children, title }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="mock-modal">
                <h1>{title}</h1>
                {children}
            </div>
        );
    }
}));

const mockCheckpoints: VideoCheckpoint[] = [
    { time: 5, questionId: 'q1' }
];

const mockQuestions: Record<string, QuestionData> = {
    'q1': {
        id: 'q1',
        text: 'Question 1',
        options: [
            { id: 'opt1', text: 'Option 1', isCorrect: true },
            { id: 'opt2', text: 'Option 2', isCorrect: false }
        ]
    }
};

describe('InteractiveVideo', () => {
    it('renders video element', () => {
        const { container } = render(<InteractiveVideo src="test.mp4" checkpoints={mockCheckpoints} questions={mockQuestions} />);
        const video = container.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', 'test.mp4');
    });

    it('pauses and shows modal at checkpoint', () => {
        const { container } = render(<InteractiveVideo src="test.mp4" checkpoints={mockCheckpoints} questions={mockQuestions} />);
        const video = container.querySelector('video') as HTMLVideoElement;

        // Mock play/pause
        video.pause = vi.fn();
        video.play = vi.fn().mockImplementation(() => Promise.resolve());

        // Simulate time update to 5s
        // We need to set currentTime manually because it's a readonly property usually, but in JSDOM it might be writable or we mock it.
        // In JSDOM, video.currentTime is writable.

        act(() => {
            video.currentTime = 5;
            fireEvent.timeUpdate(video);
        });

        // Should pause
        expect(video.pause).toHaveBeenCalled();

        // Should show modal
        expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
        expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('resumes video after correct answer', () => {
        const { container } = render(<InteractiveVideo src="test.mp4" checkpoints={mockCheckpoints} questions={mockQuestions} />);
        const video = container.querySelector('video') as HTMLVideoElement;

        video.pause = vi.fn();
        video.play = vi.fn().mockImplementation(() => Promise.resolve());

        act(() => {
            video.currentTime = 5;
            fireEvent.timeUpdate(video);
        });

        // Select correct option
        fireEvent.click(screen.getByText('Option 1'));

        // Click Check/Submit
        fireEvent.click(screen.getByText('Comprobar'));

        // Click Continue
        fireEvent.click(screen.getByText('Continuar Video'));

        // Should resume
        expect(video.play).toHaveBeenCalled();
        expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
});
