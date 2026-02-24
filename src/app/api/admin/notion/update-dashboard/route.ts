import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        const syncService = new NotionSyncService();
        await syncService.updateDashboard();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Dashboard Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
