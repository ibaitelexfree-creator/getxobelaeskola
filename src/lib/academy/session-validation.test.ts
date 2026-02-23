import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSessionOverlap } from './session-validation';

describe('validateSessionOverlap', () => {
    const mockSupabase: any = {
        from: vi.fn(),
    };
    const mockQuery: any = {
        select: vi.fn(),
        neq: vi.fn(),
        lt: vi.fn(),
        gt: vi.fn(),
        or: vi.fn(),
        maybeSingle: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase.from.mockReturnValue(mockQuery);
        mockQuery.select.mockReturnValue(mockQuery);
        mockQuery.neq.mockReturnValue(mockQuery);
        mockQuery.lt.mockReturnValue(mockQuery);
        mockQuery.gt.mockReturnValue(mockQuery);
        mockQuery.or.mockReturnValue(mockQuery);
        mockQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
    });

    it('should return allowed if no overlap', async () => {
        const result = await validateSessionOverlap(mockSupabase, {
            instructor_id: 'inst-1',
            fecha_inicio: '2024-01-01T10:00:00Z',
            fecha_fin: '2024-01-01T12:00:00Z',
            embarcacion_id: null,
            exclude_session_id: undefined
        });

        expect(result.allowed).toBe(true);
        expect(mockSupabase.from).toHaveBeenCalledWith('sesiones');
        expect(mockQuery.lt).toHaveBeenCalledWith('fecha_inicio', '2024-01-01T12:00:00Z');
        expect(mockQuery.gt).toHaveBeenCalledWith('fecha_fin', '2024-01-01T10:00:00Z');
        expect(mockQuery.or).toHaveBeenCalledWith('instructor_id.eq.inst-1');
    });

    it('should detect instructor overlap', async () => {
        mockQuery.maybeSingle.mockResolvedValue({ data: { instructor_id: 'inst-1', id: 'conflict-1' }, error: null });

        const result = await validateSessionOverlap(mockSupabase, {
            instructor_id: 'inst-1',
            fecha_inicio: '2024-01-01T10:00:00Z',
            fecha_fin: '2024-01-01T12:00:00Z',
            embarcacion_id: null
        });

        expect(result.allowed).toBe(false);
        expect(result.error).toContain('instructor');
    });

    it('should detect boat overlap', async () => {
        mockQuery.maybeSingle.mockResolvedValue({ data: { embarcacion_id: 'boat-1', id: 'conflict-2' }, error: null });

        const result = await validateSessionOverlap(mockSupabase, {
            embarcacion_id: 'boat-1',
            fecha_inicio: '2024-01-01T10:00:00Z',
            fecha_fin: '2024-01-01T12:00:00Z',
            instructor_id: null
        });

        expect(result.allowed).toBe(false);
        expect(result.error).toContain('embarcación');
    });

    it('should exclude session ID if provided', async () => {
        await validateSessionOverlap(mockSupabase, {
            instructor_id: 'inst-1',
            fecha_inicio: '2024-01-01T10:00:00Z',
            fecha_fin: '2024-01-01T12:00:00Z',
            exclude_session_id: 'sess-1',
            embarcacion_id: null
        });

        // Check if neq was called with 'id' and 'sess-1'
        expect(mockQuery.neq).toHaveBeenCalledWith('id', 'sess-1');
    });

    it('should combine OR conditions if both instructor and boat provided', async () => {
        await validateSessionOverlap(mockSupabase, {
            instructor_id: 'inst-1',
            embarcacion_id: 'boat-1',
            fecha_inicio: '2024-01-01T10:00:00Z',
            fecha_fin: '2024-01-01T12:00:00Z',
        });

        // The exact string depends on order, but here logic is deterministic
        expect(mockQuery.or).toHaveBeenCalledWith('instructor_id.eq.inst-1,embarcacion_id.eq.boat-1');
    });

    it('should handle error from Supabase', async () => {
        mockQuery.maybeSingle.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        await expect(validateSessionOverlap(mockSupabase, {
            instructor_id: 'inst-1',
            fecha_inicio: '2024-01-01T10:00:00Z',
            fecha_fin: '2024-01-01T12:00:00Z',
            embarcacion_id: null
        })).rejects.toThrow('Error verifying availability');
    });
});
