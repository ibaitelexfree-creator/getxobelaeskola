
import { describe, it, expect, vi, beforeEach } from 'vitest';
import sitemap from './sitemap';

// Mock Supabase admin client
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

const mockSupabase = {
  from: mockFrom,
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockSupabase,
}));

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default chain setup
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq, // For chained .eq()
      order: mockOrder, // If order is used
      then: (resolve: any) => resolve({ data: [], error: null }), // Mock promise resolution
    });
  });

  it('should generate sitemap entries for static paths, courses, and modules', async () => {
    // Mock data
    const mockCourses = [
      { slug: 'course-1', updated_at: '2023-01-01T00:00:00Z' },
      { slug: 'course-2', updated_at: '2023-01-02T00:00:00Z' },
    ];

    const mockModules = [
      { id: 'module-1', updated_at: '2023-02-01T00:00:00Z' },
      { id: 'module-2', updated_at: '2023-02-02T00:00:00Z' },
    ];

    // Mock implementation for specific tables
    mockFrom.mockImplementation((table: string) => {
      if (table === 'cursos') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: mockCourses, error: null }),
            }),
          }),
        };
      }
      if (table === 'modulos') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: mockModules, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }) };
    });

    const entries = await sitemap();

    // Verify static paths exist
    expect(entries.some(e => e.url.includes('/es/courses'))).toBe(true);

    // Verify dynamic courses exist
    expect(entries.some(e => e.url.includes('/es/courses/course-1'))).toBe(true);
    expect(entries.some(e => e.url.includes('/eu/courses/course-2'))).toBe(true);

    // Verify dynamic modules exist
    expect(entries.some(e => e.url.includes('/es/academy/module/module-1'))).toBe(true);
    expect(entries.some(e => e.url.includes('/eu/academy/module/module-2'))).toBe(true);

    // Verify fetching calls
    expect(mockFrom).toHaveBeenCalledWith('cursos');
    expect(mockFrom).toHaveBeenCalledWith('modulos');
  });

  it('should handle errors gracefully', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: null, error: 'DB Error' }),
        }),
      }),
    });

    const entries = await sitemap();

    // Should still return static paths even if DB fails
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some(e => e.url.includes('/es/courses'))).toBe(true);
  });
});
