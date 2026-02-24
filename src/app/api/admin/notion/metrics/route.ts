import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const syncService = new NotionSyncService();
        const metrics = await syncService.getGlobalMetrics();

        return NextResponse.json({
            summary: metrics
        });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error fetching global metrics:', err);
        return NextResponse.json({ error: err.message || 'Failed to fetch global metrics' }, { status: 500 });
    }
}
