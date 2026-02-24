import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFinancialReports, FinancialTransaction } from './useFinancialReports';

// Mocks
vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: vi.fn(),
    }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

vi.mock('@/lib/api', () => ({
    apiUrl: (path: string) => path,
}));

vi.mock('@/lib/utils/financial', () => ({
    parseAmount: (val: any) => Number(val) || 0,
}));

describe('useFinancialReports', () => {
    const mockData: FinancialTransaction[] = [
        {
            id: '1',
            created_at: '2023-01-01T10:00:00Z',
            fecha_pago: '2023-01-01T10:00:00Z',
            monto_total: 100,
            estado_pago: 'pagado',
            profiles: { nombre: 'John', apellidos: 'Doe' },
            servicios_alquiler: { nombre_es: 'Service A' }
        },
        {
            id: '2',
            created_at: '2023-01-02T10:00:00Z',
            fecha_pago: null,
            monto_total: 50,
            estado_pago: 'pendiente',
            profiles: { nombre: 'Jane', apellidos: 'Smith' },
            servicios_alquiler: { nombre_es: 'Service B' }
        }
    ];

    it('initializes with data and calculates revenue', () => {
        const { result } = renderHook(() => useFinancialReports({ initialData: mockData, initialView: 'year' }));

        expect(result.current.transactions).toHaveLength(2);
        // Ensure revenue is calculated correctly (mock parseAmount converts directly)
        expect(result.current.totalRevenue).toBe(150);
    });

    it('filters by status', () => {
        const { result } = renderHook(() => useFinancialReports({ initialData: mockData, initialView: 'year' }));

        act(() => {
            result.current.setStatusFilter('pagado');
        });

        expect(result.current.filteredData).toHaveLength(1);
        expect(result.current.filteredData[0].id).toBe('1');
        expect(result.current.totalRevenue).toBe(100);
    });

    it('filters by service', () => {
        const { result } = renderHook(() => useFinancialReports({ initialData: mockData, initialView: 'year' }));

        act(() => {
            result.current.setServiceFilter('Service B');
        });

        expect(result.current.filteredData).toHaveLength(1);
        expect(result.current.filteredData[0].id).toBe('2');
    });

    it('filters by search term', () => {
        const { result } = renderHook(() => useFinancialReports({ initialData: mockData, initialView: 'year' }));

        act(() => {
            result.current.setSearchTerm('Jane');
        });

        expect(result.current.filteredData).toHaveLength(1);
        expect(result.current.filteredData[0].profiles?.nombre).toBe('Jane');
    });
});
