
import { render } from '@testing-library/react';
import { BranchingScenarioMission } from './BranchingScenarioMission';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { GraphMissionData } from '../types';

// Mock the store
const mockSubmitAnswer = vi.fn();
const mockStartMission = vi.fn();
const mockGoToStep = vi.fn();
const mockCompleteMission = vi.fn();
const mockFailMission = vi.fn();
const mockSetFeedback = vi.fn();

vi.mock('../store', () => ({
    useMissionStore: () => ({
        startMission: mockStartMission,
        currentStepId: 'step1',
        score: 0,
        submitAnswer: mockSubmitAnswer,
        goToStep: mockGoToStep,
        completeMission: mockCompleteMission,
        failMission: mockFailMission,
        setFeedback: mockSetFeedback,
        status: 'playing'
    })
}));

describe('BranchingScenarioMission Security', () => {
    const mockData: GraphMissionData = {
        tipo_contenido: 'mision_tactica',
        initial_step_id: 'step1',
        steps: {
            step1: {
                id: 'step1',
                content: 'Normal content <script>alert("xss")</script><img src=x onerror=alert(1)>',
                options: []
            }
        }
    };

    it('sanitizes malicious HTML in step content', () => {
        const { container } = render(<BranchingScenarioMission data={mockData} />);

        const contentSpan = container.querySelector('h3 span');
        expect(contentSpan).toBeInTheDocument();

        // DOMPurify should remove the script tag and the onerror attribute
        const html = contentSpan?.innerHTML;
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('onerror');
        expect(html).toContain('Normal content');
        expect(html).toContain('<img src="x">');
    });
});
