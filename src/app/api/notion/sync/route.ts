
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const mode = searchParams.get('mode') || 'pull'; // 'pull' or 'push'
    const table = searchParams.get('table');

    if (secret !== 'getxo_notion_sync_2026_pro') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
