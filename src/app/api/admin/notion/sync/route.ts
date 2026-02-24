import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(req: Request) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        const { direction = 'pull', table } = await req.json();

        if (!table) {
            return NextResponse.json({ error: 'Table is required' }, { status: 400 });
        }

        // --- SECURITY: VALIDATE TABLE NAME (PR #228, #218) ---
        // Only allow alphanumeric characters and underscores to prevent injection
        if (!/^[a-zA-Z0-9_]+$/.test(table)) {
            return NextResponse.json({ error: 'Invalid table name format' }, { status: 400 });
        }
        // ----------------------------------------------------

        const syncService = new NotionSyncService();
        const result = await syncService.syncTable(table, direction);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Notion Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
