import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WrittenExerciseSubmission from './WrittenExerciseSubmission';
import { submitExerciseAttempt } from '@/actions/peer-review';

// Mock the server action
vi.mock('@/actions/peer-review', () => ({
    submitExerciseAttempt: vi.fn(),
}));

describe('WrittenExerciseSubmission', () => {
    const mockActivity = {
        id: 'act-123',
        titulo_es: 'Título de prueba',
        titulo_eu: 'Test Title EU',
        descripcion_es: 'Descripción de prueba',
        descripcion_eu: 'Test Description EU',
    };

    it('renders correctly', () => {
        render(
            <WrittenExerciseSubmission
                activity={mockActivity}
                unitId="unit-123"
                locale="es"
            />
        );

        expect(screen.getByText('Título de prueba')).toBeDefined();
        expect(screen.getByPlaceholderText('Escribe tu respuesta aquí...')).toBeDefined();
    });

    it('submits the form', async () => {
        vi.mocked(submitExerciseAttempt).mockResolvedValue({ success: true });

        render(
            <WrittenExerciseSubmission
                activity={mockActivity}
                unitId="unit-123"
                locale="es"
            />
        );

        const textarea = screen.getByPlaceholderText('Escribe tu respuesta aquí...');
        fireEvent.change(textarea, { target: { value: 'Mi respuesta' } });

        const button = screen.getByText('Enviar');
        fireEvent.click(button);

        await waitFor(() => {
            expect(submitExerciseAttempt).toHaveBeenCalledWith({
                activityId: 'act-123',
                content: 'Mi respuesta',
                unitId: 'unit-123',
            });
        });
    });
});
