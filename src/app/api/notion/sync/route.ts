import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const mode = (searchParams.get('mode') || 'pull') as 'pull' | 'push';
    const table = searchParams.get('table');

    if (secret !== 'getxo_notion_sync_2026_pro') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!table) {
        return NextResponse.json({ error: 'Table is required' }, { status: 400 });
    }

    // --- SECURITY: VALIDATE TABLE NAME (PR #228) ---
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
        return NextResponse.json({ error: 'Invalid table name format' }, { status: 400 });
    }
    // ------------------------------------------------

    try {
        const syncService = new NotionSyncService();
        // Since this might be called by external hooks, we run it and return
        // but the service methods are currently async and we wait for them here.
        const result = await syncService.syncTable(table, mode);

        return NextResponse.json({
            message: 'Sync completed successfully',
            mode,
            result
        });
    } catch (err: any) {
        console.error('Legacy Sync Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
