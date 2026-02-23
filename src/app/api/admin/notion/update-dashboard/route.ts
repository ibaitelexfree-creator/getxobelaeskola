
import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const syncService = new NotionSyncService();
        await syncService.updateDashboard();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Dashboard Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
