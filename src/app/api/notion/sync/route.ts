
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const mode = searchParams.get('mode') || 'pull'; // 'pull' or 'push'
    const table = searchParams.get('table');

    if (secret !== 'getxo_notion_sync_2026_pro') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        if (process.env.NEXT_RUNTIME === 'nodejs') {
            const path = await import('node:path');
            const { exec } = await import('node:child_process');
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
                },
                windowsHide: true
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
        } else {
            return NextResponse.json({ error: 'Sync only supported in Node.js runtime' }, { status: 400 });
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
