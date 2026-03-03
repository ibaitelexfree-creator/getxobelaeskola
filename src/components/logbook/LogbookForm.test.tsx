import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogbookForm from './LogbookForm';
import React from 'react';

// Mock next/navigation
const mockRefresh = vi.fn();
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
        push: mockPush,
    }),
}));

describe('LogbookForm', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should render the form with default values', () => {
        render(<LogbookForm />);

        expect(screen.getByText('Nueva Salida al Mar')).toBeDefined();
        expect(screen.getByLabelText('Fecha')).toHaveValue(new Date().toISOString().split('T')[0]);
        expect(screen.getByLabelText('Viento (Nudos)')).toHaveValue(0);
    });

    it('should show validation errors when required fields are empty', async () => {
        render(<LogbookForm />);

        const submitButton = screen.getByText('Registrar Salida');

        // Clear default date
        fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '' } });
        fireEvent.click(submitButton);

        expect(await screen.findByText('La fecha es obligatoria')).toBeInTheDocument();
        expect(await screen.findByText('El puerto es obligatorio')).toBeInTheDocument();
    });

    it('should submit form successfully and call onSuccess', async () => {
        const onSuccess = vi.fn();
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<LogbookForm onSuccess={onSuccess} />);

        fireEvent.change(screen.getByLabelText('Puerto de Salida'), { target: { value: 'Getxo' } });
        fireEvent.change(screen.getByLabelText('Tripulación'), { target: { value: 'Jules' } });

        fireEvent.click(screen.getByText('Registrar Salida'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/logbook/diary', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"puerto_salida":"Getxo"')
            }));
        });

        expect(onSuccess).toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('should show error message when API returns an error', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Error de servidor' }),
        });

        render(<LogbookForm />);

        fireEvent.change(screen.getByLabelText('Puerto de Salida'), { target: { value: 'Getxo' } });
        fireEvent.click(screen.getByText('Registrar Salida'));

        expect(await screen.findByText('Error de servidor')).toBeInTheDocument();
    });

    it('should show generic error message when fetch throws exception', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        render(<LogbookForm />);

        fireEvent.change(screen.getByLabelText('Puerto de Salida'), { target: { value: 'Getxo' } });
        fireEvent.click(screen.getByText('Registrar Salida'));

        expect(await screen.findByText('Network error')).toBeInTheDocument();
    });
});
