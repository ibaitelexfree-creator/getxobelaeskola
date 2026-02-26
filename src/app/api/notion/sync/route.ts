<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
=======

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
>>>>>>> pr-286

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
<<<<<<< HEAD
    const mode = (searchParams.get('mode') || 'pull') as 'pull' | 'push';
=======
    const mode = searchParams.get('mode') || 'pull'; // 'pull' or 'push'
>>>>>>> pr-286
    const table = searchParams.get('table');

    if (secret !== 'getxo_notion_sync_2026_pro') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

<<<<<<< HEAD
    if (!table) {
        return NextResponse.json({ error: 'Table is required' }, { status: 400 });
    }

    // --- SECURITY: VALIDATE TABLE NAME (PR #228) ---
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
        return NextResponse.json({ error: 'Invalid table name format' }, { status: 400 });
    }
    // ------------------------------------------------

    try {
        const syncService = new NotionSyncService();
        // Since this might be called by external hooks, we run it and return
        // but the service methods are currently async and we wait for them here.
        const result = await syncService.syncTable(table, mode);

        return NextResponse.json({
            message: 'Sync completed successfully',
            mode,
            result
        });
    } catch (err: any) {
        console.error('Legacy Sync Error:', err);
=======
    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');

        // We run it as a background process to avoid timing out the request
        const command = `node ${scriptPath} ${mode} ${table || ''}`;

        console.log(`Executing sync command: ${command}`);

        exec(command, {
            env: {
                ...process.env,
                // Ensure env vars are passed if not already in process.env
                SUPABASE_URL: process.env.SUPABASE_URL || 'https://xbledhifomblirxurtyv.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
                NOTION_TOKEN: process.env.NOTION_TOKEN
            }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Sync script error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Sync script stderr: ${stderr}`);
                return;
            }
            console.log(`Sync script output: ${stdout}`);
        });

        return NextResponse.json({ message: 'Sync started successfully', mode });
    } catch (err: any) {
>>>>>>> pr-286
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
