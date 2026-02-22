import { describe, it, expect, vi, beforeEach } from 'vitest';
import middleware from '../../middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock Dependencies
vi.mock('next-intl/middleware', () => ({
  default: () => () => {
    return NextResponse.next();
  }
}));

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser
    },
    from: () => ({
      select: mockSelect
    })
  })
}));

// Setup chain for Supabase query builder
mockSelect.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ single: mockSingle });

describe('Middleware Security Audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default valid session
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    // Default to admin role
    mockSingle.mockResolvedValue({ data: { rol: 'admin' } });
  });

  it('allows admin to access /api/admin', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/users');
    const res = await middleware(req);

    expect(mockGetUser).toHaveBeenCalled();
    expect(mockSingle).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('blocks non-admin from /api/admin with 403', async () => {
    mockSingle.mockResolvedValue({ data: { rol: 'user' } }); // Not admin
    const req = new NextRequest('http://localhost:3000/api/admin/users');
    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it('redirects non-admin from /es/staff to /es/unauthorized', async () => {
    mockSingle.mockResolvedValue({ data: { rol: 'user' } });
    const req = new NextRequest('http://localhost:3000/es/staff');
    const res = await middleware(req);

    expect(res.status).toBe(307); // Temporary Redirect default in Next.js
    expect(res.headers.get('location')).toContain('/es/unauthorized');
  });

  it('redirects unauthenticated user from /es/staff to login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: 'No session' });
    const req = new NextRequest('http://localhost:3000/es/staff');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/es/auth/login');
  });

  it('allows instructor to access /es/staff', async () => {
      mockSingle.mockResolvedValue({ data: { rol: 'instructor' } });
      const req = new NextRequest('http://localhost:3000/es/staff');
      const res = await middleware(req);
      expect(res.status).toBe(200);
  });

  it('calls getUser on public routes (session maintenance)', async () => {
      const req = new NextRequest('http://localhost:3000/es/student/dashboard');
      const res = await middleware(req);

      expect(mockGetUser).toHaveBeenCalled();
      // Should NOT call profiles query because it's not a protected route in middleware logic (yet)
      // Wait, is /student/dashboard protected? The prompt didn't ask to protect student dashboard here,
      // only /staff and /api/admin.
      // My middleware logic only checks profiles if (isApiAdmin || isStaffPage).
      // So this expectation is correct.
      expect(mockSelect).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
  });
});
