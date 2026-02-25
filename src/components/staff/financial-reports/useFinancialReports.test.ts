import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    beforeEach(() => {
        // Mock system time to ensure consistent date filtering
        // "now" will be 2023-06-01, so "year" filter covers 2023-01-01
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-06-01T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with data and calculates revenue', () => {
        const { result } = renderHook(() => useFinancialReports({ initialData: mockData, initialView: 'year' }));

        // Wait for effects if any (though useFinancialReports uses sync state for initialData mostly)

        expect(result.current.transactions).toHaveLength(2);
        // "year" view from 2023-06-01 goes back 365 days -> includes Jan 2023.
        expect(result.current.filteredData).toHaveLength(2);
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
