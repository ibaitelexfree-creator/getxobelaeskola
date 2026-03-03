
import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const syncService = new NotionSyncService();
        const metrics = await syncService.getGlobalMetrics();

        return NextResponse.json({
            summary: metrics
        });
    } catch (error: any) {
        console.error('Error fetching global metrics:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch global metrics' }, { status: 500 });
    }
}
