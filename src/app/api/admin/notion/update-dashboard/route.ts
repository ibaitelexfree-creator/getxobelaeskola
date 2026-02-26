<<<<<<< HEAD
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
=======

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'notion-premium-dashboard.js');
        // Child process inherits env, but we make sure NOTION_TOKEN is there
        const command = `node ${scriptPath}`;

        exec(command, {
            env: {
                ...process.env,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                NOTION_TOKEN: process.env.NOTION_TOKEN || ''
            }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Dashboard Update Error:', stderr);
                resolve(NextResponse.json({ error: stderr || 'Execution failed' }, { status: 500 }));
                return;
            }
            resolve(NextResponse.json({ success: true, output: stdout }));
        });
    });
>>>>>>> pr-286
}
