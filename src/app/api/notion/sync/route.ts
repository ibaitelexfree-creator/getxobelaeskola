
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const mode = searchParams.get('mode') || 'pull'; // 'pull' or 'push'
    const table = searchParams.get('table') || '';

    const expectedSecret = process.env.NOTION_SYNC_SECRET || 'getxo_notion_sync_2026_pro';

    if (!secret || secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Input validation to prevent command injection
    if (mode !== 'pull' && mode !== 'push') {
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    if (table && !/^[a-z0-9_]+$/.test(table)) {
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');

        console.log(`Executing sync: mode=${mode}, table=${table}`);

        // Use spawn with argument array to prevent shell injection
        const child = spawn('node', [scriptPath, mode, table], {
            env: {
                ...process.env,
                // Ensure env vars are passed if not already in process.env
                SUPABASE_URL: process.env.SUPABASE_URL || 'https://xbledhifomblirxurtyv.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
                NOTION_TOKEN: process.env.NOTION_TOKEN
            }
        });

        child.stdout.on('data', (data) => {
            console.log(`Sync script output: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.error(`Sync script stderr: ${data}`);
        });

        child.on('error', (error) => {
            console.error(`Sync script error: ${error.message}`);
        });

        return NextResponse.json({ message: 'Sync started successfully', mode });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
