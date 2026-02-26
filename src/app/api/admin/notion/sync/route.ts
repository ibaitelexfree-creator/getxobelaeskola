<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { NotionSyncService } from '@/lib/services/notion-sync';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(req: Request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const { direction = 'pull', table } = await req.json();

        if (!table || typeof table !== 'string') {
            return NextResponse.json({ error: 'Table is required' }, { status: 400 });
        }

        // --- SECURITY: VALIDATE TABLE NAME (PR #228, #218) ---
        // Only allow alphanumeric characters and underscores to prevent injection
        if (!/^[a-zA-Z0-9_]+$/.test(table)) {
            return NextResponse.json({ error: 'Invalid table name format' }, { status: 400 });
        }
        // ----------------------------------------------------

        const syncService = new NotionSyncService();
        const result = await syncService.syncTable(table, direction);

        return NextResponse.json(result);
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Notion Sync Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
=======

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    const { direction = 'pull', table } = await req.json();

    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');
        const command = `node ${scriptPath} ${direction} ${table || ''}`;

        exec(command, {
            env: {
                ...process.env,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                NOTION_TOKEN: process.env.NOTION_TOKEN || ''
            }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Sync Error:', stderr);
                resolve(NextResponse.json({ error: stderr || error.message }, { status: 500 }));
                return;
            }
            resolve(NextResponse.json({ output: stdout }));
        });
    });
>>>>>>> pr-286
}
