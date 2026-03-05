import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createClient } from '@/lib/supabase/server';
import { PushService } from '@/lib/notifications/PushService';

const mockSupabase = {
    auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'instructor-123' } }, error: null })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(function (this: any) {
        if (this.tableName === 'profiles') {
            return Promise.resolve({ data: { rol: 'instructor' }, error: null });
        }
        if (this.tableName === 'instructor_feedback') {
            return Promise.resolve({ data: { id: 'feedback-1' }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
    }),
    insert: vi.fn().mockReturnThis(),
};

// Override select to return the mock with single
(mockSupabase.from as any).mockImplementation((table: string) => {
    (mockSupabase as any).tableName = table;
    return mockSupabase;
});

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

vi.mock('@/lib/notifications/PushService', () => ({
    PushService: {
        sendToUser: vi.fn().mockResolvedValue({ success: true })
    }
}));

describe('Feedback API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create feedback and send push notification', async () => {
        const formData = new FormData();
        formData.append('student_id', 'student-456');
        formData.append('context_type', 'logbook');
        formData.append('context_id', 'log-789');
        formData.append('content', 'Great job!');

        const req = {
            formData: vi.fn().mockResolvedValue(formData)
        } as any;

        const response = await POST(req);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(PushService.sendToUser).toHaveBeenCalledWith(
            'student-456',
            expect.any(String),
            expect.any(String),
            expect.objectContaining({ context_type: 'logbook', context_id: 'log-789' })
        );
    });
});
