import { renderHook, act } from '@testing-library/react';
import { useFinancialData } from './useFinancialData';
import { FinancialTransaction } from './types';
import { describe, it, expect, vi } from 'vitest';

const mockTransactions: FinancialTransaction[] = [
    {
        id: '1',
        monto_total: 100,
        estado_pago: 'pagado',
        fecha_pago: '2023-01-01T10:00:00Z',
        created_at: '2023-01-01T10:00:00Z',
        servicios_alquiler: { nombre_es: 'Service A' },
        profiles: { nombre: 'John', apellidos: 'Doe' },
        history: [],
        _field: 'fecha_pago'
    },
    {
        id: '2',
        monto_total: 200,
        estado_pago: 'pendiente',
        fecha_pago: '2023-01-02T10:00:00Z',
        created_at: '2023-01-02T10:00:00Z',
        servicios_alquiler: { nombre_es: 'Service B' },
        profiles: { nombre: 'Jane', apellidos: 'Smith' },
        history: [],
        _field: 'fecha_pago'
    }
];

describe('useFinancialData', () => {
    it('should initialize with data', () => {
        const { result } = renderHook(() => useFinancialData(mockTransactions));

        act(() => {
            result.current.setForceShowAll(true);
        });

        expect(result.current.transactions).toEqual(mockTransactions);
        expect(result.current.totalRevenue).toBe(300);
    });

    it('should filter by status', () => {
        const { result } = renderHook(() => useFinancialData(mockTransactions));

        act(() => {
            result.current.setForceShowAll(true);
            result.current.setStatusFilter('pagado');
        });

        expect(result.current.filteredData).toHaveLength(1);
        expect(result.current.filteredData[0].id).toBe('1');
    });

    it('should filter by service', () => {
        const { result } = renderHook(() => useFinancialData(mockTransactions));

        act(() => {
            result.current.setForceShowAll(true);
            result.current.setServiceFilter('Service B');
        });

        expect(result.current.filteredData).toHaveLength(1);
        expect(result.current.filteredData[0].id).toBe('2');
    });

    it('should respect forceShowAll', () => {
         const { result } = renderHook(() => useFinancialData(mockTransactions));

         // By default it filters by date (year), so filteredData should be empty for 2023 data
         expect(result.current.filteredData).toHaveLength(0);

         act(() => {
             result.current.setForceShowAll(true);
         });

         expect(result.current.filteredData).toHaveLength(2);
    });
});
