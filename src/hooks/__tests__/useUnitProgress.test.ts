import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnitProgress } from '../useUnitProgress';

// Mock apiUrl
vi.mock('@/lib/api', () => ({
    apiUrl: (url: string) => `http://localhost${url}`
}));

describe('useUnitProgress hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        global.fetch = vi.fn();
    });

    it('should track reading time', () => {
        const { result } = renderHook(() => useUnitProgress({
            unidadId: 'u1',
            isCompletado: false,
            erroresComunes: undefined
        }));

        expect(result.current.tiempoLectura).toBe(0);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.tiempoLectura).toBe(1);
    });

    it('should not track time if completed', () => {
        const { result } = renderHook(() => useUnitProgress({
            unidadId: 'u1',
            isCompletado: true,
            erroresComunes: undefined
        }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.tiempoLectura).toBe(0);
    });

    it('should register section view and update flag', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });

        const { result } = renderHook(() => useUnitProgress({
            unidadId: 'u1',
            isCompletado: false,
            erroresComunes: undefined
        }));

        // Total sections = 2 (standard)
        expect(result.current.puedeCompletar).toBe(false);

        await act(async () => {
            await result.current.registrarLectura('section1');
            await result.current.registrarLectura('section2');
            vi.advanceTimersByTime(30000); // 30 seconds
        });

        expect(result.current.seccionesVistas).toContain('section1');
        expect(result.current.seccionesVistas).toContain('section2');
        expect(result.current.puedeCompletar).toBe(true);
    });

    it('should handle server error response gracefully', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ success: false })
        });

        const { result } = renderHook(() => useUnitProgress({
            unidadId: 'u1',
            isCompletado: false,
            erroresComunes: undefined
        }));

        await act(async () => {
            await result.current.registrarLectura('section1');
        });

        // Optimistic update should still be there
        expect(result.current.seccionesVistas).toContain('section1');
        expect(warnSpy).toHaveBeenCalledWith('Failed to register section read');
        warnSpy.mockRestore();
    });

    it('should handle network error gracefully', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const networkError = new Error('Network failure');
        (global.fetch as any).mockRejectedValue(networkError);

        const { result } = renderHook(() => useUnitProgress({
            unidadId: 'u1',
            isCompletado: false,
            erroresComunes: undefined
        }));

        await act(async () => {
            await result.current.registrarLectura('section1');
        });

        // Optimistic update should still be there
        expect(result.current.seccionesVistas).toContain('section1');
        expect(errorSpy).toHaveBeenCalledWith('Error registering read:', networkError);
        errorSpy.mockRestore();
    });
});
