import React from 'react';
import { render, screen } from '@testing-library/react';
import { TacticalScenarioMission } from './TacticalScenarioMission';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ fill, priority, sizes, ...props }: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return (
            <img
                {...props}
                data-testid="next-image"
                data-fill={fill ? "true" : "false"}
                data-priority={priority ? "true" : "false"}
                data-sizes={sizes}
            />
        );
    },
}));

const { mockStartMission, mockSubmitAnswer, mockNextStep, mockSetFeedback } = vi.hoisted(() => ({
    mockStartMission: vi.fn(),
    mockSubmitAnswer: vi.fn(),
    mockNextStep: vi.fn(),
    mockSetFeedback: vi.fn(),
}));

vi.mock('../store', () => ({
    useMissionStore: Object.assign(
        () => ({
            status: 'playing',
            currentStep: 0,
            totalSteps: 1,
            score: 0,
            startMission: mockStartMission,
            submitAnswer: mockSubmitAnswer,
            nextStep: mockNextStep,
            completeMission: vi.fn(),
            failMission: vi.fn(),
            setFeedback: mockSetFeedback,
        }),
        {
            getState: () => ({ score: 0 }),
        }
    ),
}));

describe('TacticalScenarioMission', () => {
    const mockData = {
        tipo_contenido: 'mision_tactica' as any,
        escenarios: [
            {
                pregunta: 'Test Question',
                imagen_url: 'https://getxobelaeskola.cloud/images/test.jpg',
                opciones: ['A', 'B'],
                correcta: 0,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the optimized image with correct props', () => {
        const { debug } = render(<TacticalScenarioMission data={mockData} />);

        // debug();

        const image = screen.getByTestId('next-image');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://getxobelaeskola.cloud/images/test.jpg');
        expect(image).toHaveAttribute('data-fill', 'true');
        expect(image).toHaveAttribute('data-priority', 'true');
        expect(image).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
    });
});
