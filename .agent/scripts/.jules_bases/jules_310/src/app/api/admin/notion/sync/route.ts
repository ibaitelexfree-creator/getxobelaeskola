
import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';

export async function POST(req: Request) {
    try {
        const { direction = 'pull', table } = await req.json();

        if (!table) {
            return NextResponse.json({ error: 'Table is required' }, { status: 400 });
        }

        const syncService = new NotionSyncService();
        const result = await syncService.syncTable(table, direction);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Notion Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
