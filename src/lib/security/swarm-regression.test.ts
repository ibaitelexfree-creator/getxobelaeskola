import { describe, it, expect, vi } from 'vitest';
import { GET as getUnit } from '@/app/api/unit/[id]/route';
import { POST as syncNotion } from '@/app/api/admin/notion/sync/route';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
            data: {
                id: 'test-unit',
                modulo_id: 'test-modulo',
                contenido_teorico_es: '<script>alert("xss")</script><img src=x onerror=alert(1)>'
            },
            error: null
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
}));

vi.mock('@/lib/auth-guard', () => ({
    requireAuth: vi.fn().mockResolvedValue({ user: { id: 'admin-id' }, error: null }),
    requireAdmin: vi.fn().mockResolvedValue({ user: { id: 'admin-id' }, profile: { rol: 'admin' } })
}));

import { NextResponse } from 'next/server';

vi.mock('@/lib/academy/enrollment', () => ({
    verifyUnitAccess: vi.fn().mockResolvedValue(true)
}));

describe('Swarm Security Regressions', () => {
    describe('Unit Reader XSS protection', () => {
        it('should NOT return raw script tags in unit content', async () => {
            const req = new Request('http://localhost/api/unit/test-id');
            const res = await getUnit(req, { params: { id: 'test-id' } });
            const data = await res.json();

            expect(data.unidad.contenido_teorico_es).not.toContain('<script>');
            expect(data.unidad.contenido_teorico_es).not.toContain('onerror=');
        });
    });

    describe('Notion Sync Security', () => {
        it('should reject malformed table names that look like command injection', async () => {
            const req = new Request('http://localhost/api/admin/notion/sync', {
                method: 'POST',
                body: JSON.stringify({ table: 'profiles; rm -rf /' })
            });
            const res = await syncNotion(req);
            expect(res.status).toBe(400);
        });

        it('should require admin authentication', async () => {
            const { requireAdmin } = await import('@/lib/auth-guard');
            // Force auth failure
            vi.mocked(requireAdmin).mockResolvedValueOnce({
                error: NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })
            } as any);

            const req = new Request('http://localhost/api/admin/notion/sync', {
                method: 'POST',
                body: JSON.stringify({ table: 'profiles' })
            });
            const res = await syncNotion(req);
            expect(res.status).toBe(403);
        });
    });
});
