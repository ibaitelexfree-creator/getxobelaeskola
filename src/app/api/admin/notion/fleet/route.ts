import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const syncService = new NotionSyncService();
        const fleet = await syncService.getFleetMetrics();

        return NextResponse.json({ fleet });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Notion API Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
