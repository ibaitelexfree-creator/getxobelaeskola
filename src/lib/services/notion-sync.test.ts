
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NotionSyncService } from './notion-sync';

// Mocks
const mockSupabase = {
    from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockResolvedValue({ error: null }),
    })),
    auth: { admin: { getUserById: vi.fn() } }
};

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(() => mockSupabase)
}));

const mockNotion = {
    databases: { query: vi.fn() },
    pages: { create: vi.fn(), update: vi.fn() },
    blocks: {
        children: {
            list: vi.fn().mockResolvedValue({ results: [] }),
            append: vi.fn(),
            delete: vi.fn()
        },
        delete: vi.fn()
    }
};

vi.mock('@notionhq/client', () => {
    return {
        Client: class { constructor() { return mockNotion; } }
    };
});

// Mock fs to provide configuration
vi.mock('fs', () => ({
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn((path: string) => {
        if (path.includes('map')) return JSON.stringify({ 'test_table': 'test_db_id' });
        if (path.includes('schema')) return JSON.stringify({
            definitions: {
                'test_table': {
                    properties: {
                        'name': { type: 'string' },
                        'count': { type: 'integer' }
                    }
                }
            }
        });
        return '{}';
    }),
    default: {
        existsSync: vi.fn(() => true),
        readFileSync: vi.fn(() => '{}')
    }
}));

// Mock path
vi.mock('path', () => ({
    join: vi.fn((...args) => args.join('/')),
    default: {
        join: vi.fn((...args) => args.join('/'))
    }
}));

describe('NotionSyncService', () => {
    let service: NotionSyncService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new NotionSyncService();
        (service as any).tableMap = { 'test_table': 'test_db_id' };
        (service as any).schema = {
            definitions: {
                'test_table': {
                    properties: {
                        'name': { type: 'string' },
                        'count': { type: 'integer' }
                    }
                }
            }
        };
    });

    describe('syncTable', () => {
        it('should sync rows from Supabase to Notion (pull)', async () => {
            // Setup Supabase data
            const mockRows = [{ id: 1, name: 'Test Row', count: 10 }];
            const sbQueryMock = {
                select: vi.fn().mockResolvedValue({ data: mockRows, error: null })
            };
            mockSupabase.from.mockReturnValue(sbQueryMock as any);

            // Setup Notion data
            mockNotion.databases.query.mockResolvedValue({ results: [] });

            await service.syncTable('test_table', 'pull');

            expect(mockSupabase.from).toHaveBeenCalledWith('test_table');
            expect(mockNotion.databases.query).toHaveBeenCalledWith({ database_id: 'test_db_id' });
            expect(mockNotion.pages.create).toHaveBeenCalled();

            const createCall = mockNotion.pages.create.mock.calls[0][0];
            expect(createCall.parent).toEqual({ database_id: 'test_db_id' });
            expect(createCall.properties['Supabase_ID'].rich_text[0].text.content).toBe('1');
            // 'name' is identified as the title column, so it is mapped to 'Title'
            expect(createCall.properties['Title'].title[0].text.content).toBe('Test Row');
            expect(createCall.properties['count'].number).toBe(10);
        });

        it('should update existing Notion pages (pull)', async () => {
             // Setup Supabase data
             const mockRows = [{ id: 1, name: 'Updated Row', count: 20 }];
             const sbQueryMock = {
                 select: vi.fn().mockResolvedValue({ data: mockRows, error: null })
             };
             mockSupabase.from.mockReturnValue(sbQueryMock as any);

             // Setup Notion data (existing page)
             mockNotion.databases.query.mockResolvedValue({
                 results: [{
                     id: 'page_123',
                     properties: {
                         'Supabase_ID': { rich_text: [{ plain_text: '1' }] }
                     }
                 }]
             });

             await service.syncTable('test_table', 'pull');

             expect(mockNotion.pages.create).not.toHaveBeenCalled();
             expect(mockNotion.pages.update).toHaveBeenCalled();

             const updateCall = mockNotion.pages.update.mock.calls[0][0];
             expect(updateCall.page_id).toBe('page_123');
             // 'name' is skipped in the loop because it's the title column, and 'Title' is not added in update loop unless forced?
             // Wait, logic says: if (['Supabase_ID', 'Title', ...].includes(propName)) continue;
             // But here we are constructing 'updateData' from 'notionPages'.
             // Wait, the logic for 'pull' (updating Notion from Supabase) is:
             // if (index[row.id]) await this.notion.pages.update(...)
             // The props are constructed same as create.

             expect(updateCall.properties['Title'].title[0].text.content).toBe('Updated Row');
        });

        it('should handle errors gracefully', async () => {
            const sbQueryMock = {
                select: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
            };
            mockSupabase.from.mockReturnValue(sbQueryMock as any);

            await expect(service.syncTable('test_table', 'pull')).rejects.toThrow('Supabase fetch failed');
        });
    });

    describe('updateDashboard', () => {
        it('should generate dashboard blocks', async () => {
            // Mock all the supabase calls inside fetchDashboardStats
            // This is complex because Promise.all is used.
            // We need to ensure mockSupabase.from returns appropriate mocks for each call.

            // Simplified mock for select().gte()...
            const chainMock = {
                select: vi.fn().mockReturnThis(),
                gte: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { nombre: 'Test User' } }),
                then: function(resolve: any) { resolve({ data: [] }); } // Mock Promise resolution
            };

            // We need to override the default mock behavior for specific calls if we want real data
            // For now, let's just assume empty data is fine, logic should still run.
            // But we need to make sure the promise resolves to an object with `data`.

            mockSupabase.from.mockImplementation(() => {
                return {
                    select: () => ({
                        gte: () => Promise.resolve({ data: [{ monto_total: 100 }] }), // Mock revenue
                        eq: () => Promise.resolve({ data: [] }),
                        in: () => Promise.resolve({ data: [] }),
                        order: () => ({
                            limit: () => Promise.resolve({ data: [] })
                        }),
                        single: () => Promise.resolve({ data: { nombre: 'Test' } })
                    })
                } as any;
            });

            const result = await service.updateDashboard();

            expect(result.success).toBe(true);
            expect(mockNotion.blocks.children.list).toHaveBeenCalled();
            expect(mockNotion.blocks.children.append).toHaveBeenCalled();
        });
    });
});
