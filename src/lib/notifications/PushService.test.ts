import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PushService } from './PushService';
import { firebaseAdmin } from '@/lib/firebase-admin';

const sendEachForMulticastMock = vi.fn().mockResolvedValue({
    successCount: 1,
    failureCount: 0,
    responses: [{ success: true }]
});

vi.mock('@/lib/firebase-admin', () => ({
    firebaseAdmin: {
        apps: [{ name: '[DEFAULT]' }],
        messaging: vi.fn(() => ({
            sendEachForMulticast: sendEachForMulticastMock
        }))
    }
}));

const mockSupabase: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
};

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(() => mockSupabase)
}));

describe('PushService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sendEachForMulticastMock.mockResolvedValue({
            successCount: 1,
            failureCount: 0,
            responses: [{ success: true }]
        });
    });

    it('should send push notifications to user tokens', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
            mockSupabase.tableName = table;
            return mockSupabase;
        });

        mockSupabase.eq.mockImplementation(function(this: any) {
             if (this.tableName === 'user_devices') {
                 return Promise.resolve({ data: [{ fcm_token: 'device-token' }], error: null });
             }
             return mockSupabase;
        });

        mockSupabase.single.mockResolvedValue({ data: { fcm_token: 'profile-token' }, error: null });

        const result = await PushService.sendToUser('user-123', 'Test Title', 'Test Body');

        expect(result.success).toBe(true);
        expect(result.sentCount).toBe(1);
        expect(sendEachForMulticastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                tokens: expect.arrayContaining(['device-token', 'profile-token']),
                notification: {
                    title: 'Test Title',
                    body: 'Test Body'
                }
            })
        );
    });

    it('should handle invalid tokens and remove them', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
            mockSupabase.tableName = table;
            return mockSupabase;
        });

        mockSupabase.eq.mockImplementation(function(this: any) {
             if (this.tableName === 'user_devices') {
                 if (mockSupabase._deleting) {
                      return mockSupabase;
                 }
                 return Promise.resolve({ data: [], error: null });
             }
             return mockSupabase;
        });

        mockSupabase.single.mockResolvedValue({ data: { fcm_token: 'bad-token' }, error: null });

        sendEachForMulticastMock.mockResolvedValueOnce({
            successCount: 0,
            failureCount: 1,
            responses: [{
                success: false,
                error: { code: 'messaging/registration-token-not-registered' } as any
            }]
        });

        mockSupabase.delete.mockImplementation(() => {
            mockSupabase._deleting = true;
            return mockSupabase;
        });

        mockSupabase.in.mockResolvedValue({ error: null });

        const result = await PushService.sendToUser('user-123', 'Title', 'Body');

        expect(result.success).toBe(true);
        expect(result.sentCount).toBe(0);
        expect(result.failureCount).toBe(1);

        // Verify cleanup attempt
        expect(mockSupabase.from).toHaveBeenCalledWith('user_devices');
        expect(mockSupabase.delete).toHaveBeenCalled();
        expect(mockSupabase.in).toHaveBeenCalledWith('fcm_token', ['bad-token']);

        mockSupabase._deleting = false;
    });
});
