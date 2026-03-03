import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const mode = searchParams.get('mode') || 'pull'; // 'pull' or 'push'
    const table = searchParams.get('table');

    if (!process.env.NOTION_SYNC_SECRET || secret !== process.env.NOTION_SYNC_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');

        // Use execFile instead of exec for better security against command injection
        const args = [scriptPath, mode];
        if (table) {
            args.push(table);
        }

        console.log(`Executing sync command: node ${args.join(' ')}`);

        // Background sync process
        execFile('node', args, {
            env: {
                ...process.env,
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
    } catch (err: any) {
        console.error("Sync API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
