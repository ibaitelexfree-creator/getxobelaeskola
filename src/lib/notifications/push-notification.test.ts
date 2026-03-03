import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPushNotification } from './push-notification';

// Hoist mocks
const { mockSupabase, mockFirebaseAdmin } = vi.hoisted(() => {
    return {
        mockSupabase: {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
        },
        mockFirebaseAdmin: {
            apps: { length: 1 },
            messaging: vi.fn().mockReturnValue({
                sendEachForMulticast: vi.fn(),
            }),
        }
    };
});

// Mock dependencies
vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: () => mockSupabase,
}));

vi.mock('@/lib/firebase-admin', () => ({
    firebaseAdmin: mockFirebaseAdmin,
}));

describe('sendPushNotification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFirebaseAdmin.apps.length = 1;
    });

    it('should send notifications to all unique tokens found', async () => {
        // Mock finding tokens in user_devices
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'user_devices') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({
                            data: [{ fcm_token: 'token1' }, { fcm_token: 'token2' }],
                            error: null
                        })
                    })
                };
            }
            if (table === 'profiles') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({
                                data: { fcm_token: 'token1' }, // Duplicate token
                                error: null
                            })
                        })
                    })
                };
            }
            return mockSupabase;
        });

        const mockSendResult = {
            successCount: 2,
            failureCount: 0,
            responses: [{ success: true }, { success: true }]
        };
        mockFirebaseAdmin.messaging().sendEachForMulticast.mockResolvedValue(mockSendResult);

        const result = await sendPushNotification('user-123', {
            title: 'Test Title',
            body: 'Test Body',
            data: { key: 'value' }
        });

        expect(result.success).toBe(true);
        expect(result.successCount).toBe(2);

        // Verify messaging was called with unique tokens
        expect(mockFirebaseAdmin.messaging().sendEachForMulticast).toHaveBeenCalledWith(
            expect.objectContaining({
                tokens: expect.arrayContaining(['token1', 'token2']),
                notification: { title: 'Test Title', body: 'Test Body' },
                data: { key: 'value' }
            })
        );
        expect(mockFirebaseAdmin.messaging().sendEachForMulticast.mock.calls[0][0].tokens).toHaveLength(2);
    });

    it('should handle no tokens found', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'user_devices') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [], error: null })
                    })
                };
            }
            if (table === 'profiles') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
                        })
                    })
                };
            }
            return mockSupabase;
        });

        const result = await sendPushNotification('user-123', {
            title: 'Test',
            body: 'Test'
        });

        expect(result.success).toBe(false);
        expect(result.reason).toBe('no_tokens');
        expect(mockFirebaseAdmin.messaging().sendEachForMulticast).not.toHaveBeenCalled();
    });

    it('should handle firebase not initialized', async () => {
        mockFirebaseAdmin.apps.length = 0;

        mockSupabase.from.mockImplementation(() => ({
            select: () => ({
                eq: () => Promise.resolve({ data: [{ fcm_token: 'token1' }], error: null })
            })
        }));

        // For the profile call
        mockSupabase.from.mockImplementationOnce(() => ({
            select: () => ({
                eq: () => Promise.resolve({ data: [{ fcm_token: 'token1' }], error: null })
            })
        })).mockImplementationOnce(() => ({
             select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null })
                })
            })
        }));

        const result = await sendPushNotification('user-123', {
            title: 'Test',
            body: 'Test'
        });

        expect(result.success).toBe(false);
        expect(result.reason).toBe('firebase_not_initialized');
    });
});
