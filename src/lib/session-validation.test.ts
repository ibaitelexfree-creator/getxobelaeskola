import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSessionOverlap } from './session-validation';
import { SupabaseClient } from '@supabase/supabase-js';

describe('validateSessionOverlap', () => {
    let mockSupabase: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        // Reset mocks
        mockQueryBuilder = {
            select: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            lt: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            // Mock 'then' to behave like a Promise
            then: vi.fn((resolve) => resolve({ data: [], error: null })),
        };

        mockSupabase = {
            from: vi.fn().mockReturnValue(mockQueryBuilder),
        } as unknown as SupabaseClient;
    });

    const validSession = {
        instructor_id: 'inst-1',
        fecha_inicio: '2023-10-10T10:00:00Z',
        fecha_fin: '2023-10-10T12:00:00Z',
    };

    it('should return error if instructor_id is missing', async () => {
        const result = await validateSessionOverlap(mockSupabase, { ...validSession, instructor_id: '' });
        expect(result.error).toBe('Instructor es requerido');
    });

    it('should return error if dates are invalid', async () => {
        const result = await validateSessionOverlap(mockSupabase, { ...validSession, fecha_inicio: '' });
        expect(result.error).toBe('Fechas son requeridas');
    });

    it('should return error if start date is after end date', async () => {
        const result = await validateSessionOverlap(mockSupabase, {
            ...validSession,
            fecha_inicio: '2023-10-10T13:00:00Z',
            fecha_fin: '2023-10-10T12:00:00Z',
        });
        expect(result.error).toBe('La fecha de inicio debe ser anterior a la de fin');
    });

    it('should return null (no error) if no overlapping sessions found', async () => {
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));

        const result = await validateSessionOverlap(mockSupabase, validSession);

        expect(mockSupabase.from).toHaveBeenCalledWith('sesiones');
        expect(mockQueryBuilder.neq).toHaveBeenCalledWith('estado', 'cancelada');

        // Dates are converted to ISO string with milliseconds in the function
        const expectedEnd = new Date(validSession.fecha_fin).toISOString();
        const expectedStart = new Date(validSession.fecha_inicio).toISOString();

        expect(mockQueryBuilder.lt).toHaveBeenCalledWith('fecha_inicio', expectedEnd);
        expect(mockQueryBuilder.gt).toHaveBeenCalledWith('fecha_fin', expectedStart);
        expect(result.error).toBeNull();
    });

    it('should query for instructor overlap correctly', async () => {
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));

        await validateSessionOverlap(mockSupabase, { ...validSession, embarcacion_id: null });

        // check that .or was called with only instructor check
        expect(mockQueryBuilder.or).toHaveBeenCalledWith('instructor_id.eq.inst-1');
    });

    it('should query for instructor OR boat overlap correctly', async () => {
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));

        await validateSessionOverlap(mockSupabase, { ...validSession, embarcacion_id: 'boat-1' });

        expect(mockQueryBuilder.or).toHaveBeenCalledWith('instructor_id.eq.inst-1,embarcacion_id.eq.boat-1');
    });

    it('should return error if overlapping session found for instructor', async () => {
        // Simulate finding a session with same instructor
        const conflictSession = {
            id: 'conflict-1',
            instructor_id: 'inst-1',
            embarcacion_id: 'other-boat',
        };
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [conflictSession], error: null }));

        const result = await validateSessionOverlap(mockSupabase, validSession);

        expect(result.error).toBe('El instructor ya tiene una sesión en ese horario');
    });

    it('should return error if overlapping session found for boat', async () => {
        // Simulate finding a session with same boat
        const conflictSession = {
            id: 'conflict-1',
            instructor_id: 'other-inst',
            embarcacion_id: 'boat-1',
        };
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [conflictSession], error: null }));

        const result = await validateSessionOverlap(mockSupabase, { ...validSession, embarcacion_id: 'boat-1' });

        expect(result.error).toBe('La embarcación ya está ocupada en ese horario');
    });

    it('should ignore exclude_session_id', async () => {
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));

        await validateSessionOverlap(mockSupabase, { ...validSession, exclude_session_id: 'self-id' });

        expect(mockQueryBuilder.neq).toHaveBeenCalledWith('id', 'self-id');
    });

    it('should handle Supabase error gracefully', async () => {
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: null, error: { message: 'DB Error' } }));

        const result = await validateSessionOverlap(mockSupabase, validSession);

        expect(result.error).toBe('Error al verificar disponibilidad');
    });
});
