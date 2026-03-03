import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogbookList from '../LogbookList';
import { generateLogbookPDF } from '@/lib/logbook/logbook-pdf';
import { LogbookEntry } from '@/types/logbook';

vi.mock('@/lib/logbook/logbook-pdf', () => ({
    generateLogbookPDF: vi.fn()
}));

const mockEntries: LogbookEntry[] = [
    {
        id: '1',
        alumno_id: 'student-1',
        fecha: '2023-10-27T10:00:00Z',
        contenido: 'Salida de prueba',
        estado_animo: 'confident' as const,
        tags: [],
        created_at: '2023-10-27T10:00:00Z',
        updated_at: '2023-10-27T10:00:00Z',
        puerto_salida: 'Getxo',
        viento_nudos: 15,
        viento_direccion: 'NW'
    }
];

describe('LogbookList component', () => {
    const studentName = 'Juan Perez';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should render empty state when no entries', () => {
        render(<LogbookList entries={[]} studentName={studentName} />);
        expect(screen.getByText(/Tu bitácora está vacía/i)).toBeInTheDocument();
    });

    it('should render list of entries', () => {
        render(<LogbookList entries={mockEntries} studentName={studentName} />);
        expect(screen.getByText(/Historial de Navegación/i)).toBeInTheDocument();
        expect(screen.getByText(/Getxo/i)).toBeInTheDocument();
        expect(screen.getByText(/15 kn/i)).toBeInTheDocument();
    });

    it('should handle successful export', async () => {
        render(<LogbookList entries={mockEntries} studentName={studentName} />);

        const exportButton = screen.getByRole('button', { name: /Descargar Bitácora/i });
        fireEvent.click(exportButton);

        expect(exportButton).toBeDisabled();
        expect(screen.getByText(/Generando.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(generateLogbookPDF).toHaveBeenCalledWith(mockEntries, studentName);
        });

        await waitFor(() => {
            expect(exportButton).not.toBeDisabled();
            expect(screen.getByText(/Descargar Bitácora/i)).toBeInTheDocument();
        });
    });

    it('should handle export error path', async () => {
        const error = new Error('PDF Generation Failed');
        vi.mocked(generateLogbookPDF).mockImplementation(() => {
            throw error;
        });

        render(<LogbookList entries={mockEntries} studentName={studentName} />);

        const exportButton = screen.getByRole('button', { name: /Descargar Bitácora/i });
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error generating PDF:', error);
            expect(window.alert).toHaveBeenCalledWith('Error al generar el PDF');
        });

        await waitFor(() => {
            expect(exportButton).not.toBeDisabled();
            expect(screen.getByText(/Descargar Bitácora/i)).toBeInTheDocument();
        });
    });
});
