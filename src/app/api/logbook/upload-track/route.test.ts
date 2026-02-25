import { POST } from './route';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/auth-guard', () => ({
    requireAuth: vi.fn().mockResolvedValue({
        user: { id: 'test-user-id' },
        error: null
    })
}));

const { mockUpload, mockInsert, mockUpdate } = vi.hoisted(() => {
    return {
        mockUpload: vi.fn().mockResolvedValue({ data: { path: 'path/to/file' }, error: null }),
        mockInsert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'new-session-id' }, error: null })
            })
        }),
        mockUpdate: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'updated-session-id' }, error: null })
            })
        })
    };
});

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockReturnValue({
        storage: {
            from: vi.fn().mockReturnValue({
                upload: mockUpload
            })
        },
        from: vi.fn().mockReturnValue({
            insert: mockInsert,
            update: mockUpdate,
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
        })
    })
}));

describe('POST /api/logbook/upload-track', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should process a valid GPX file and create a new session', async () => {
        const gpxContent = `
            <?xml version="1.0" encoding="UTF-8"?>
            <gpx version="1.1" creator="StravaGPX">
            <trk>
                <name>Morning Ride</name>
                <trkseg>
                    <trkpt lat="43.350" lon="-3.010">
                        <ele>10.0</ele>
                        <time>2023-10-27T10:00:00Z</time>
                    </trkpt>
                    <trkpt lat="43.351" lon="-3.011">
                        <ele>10.0</ele>
                        <time>2023-10-27T10:01:00Z</time>
                    </trkpt>
                     <trkpt lat="43.352" lon="-3.012">
                        <ele>10.0</ele>
                        <time>2023-10-27T10:02:00Z</time>
                    </trkpt>
                </trkseg>
            </trk>
            </gpx>
        `;

        // Mock Request and FormData manually to avoid JSDOM issues
        const mockFormData = {
            get: vi.fn((key) => {
                if (key === 'file') {
                    // Mock File object interface used in the route
                    return {
                        text: async () => gpxContent,
                        name: 'track.gpx'
                    };
                }
                return null;
            })
        };

        const req = {
            formData: async () => mockFormData
        } as unknown as Request;

        const res = await POST(req);

        expect(res.status).toBe(200);

        const data = await res.json();

        expect(data.success).toBe(true);
        expect(data.stats.distance_nm).toBeGreaterThan(0);

        expect(mockUpload).toHaveBeenCalled();
        expect(mockInsert).toHaveBeenCalled();
    });
});
