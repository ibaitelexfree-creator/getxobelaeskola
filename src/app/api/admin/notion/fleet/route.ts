import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        const syncService = new NotionSyncService();
        const fleet = await syncService.getFleetMetrics();

        return NextResponse.json({ fleet });
    } catch (error: any) {
        console.error('Notion API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
