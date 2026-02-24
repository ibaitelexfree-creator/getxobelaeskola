import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const syncService = new NotionSyncService();
        await syncService.updateDashboard();
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Dashboard Update Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
