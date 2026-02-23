
import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const mode = searchParams.get('mode') || 'pull'; // 'pull' or 'push'
    const table = searchParams.get('table');

    // Secure authentication: strict requirement for environment variable
    const validSecret = process.env.NOTION_SYNC_SECRET;

    if (!validSecret) {
        console.error('SECURITY ERROR: NOTION_SYNC_SECRET is not set in environment variables.');
        return NextResponse.json({ error: 'Server misconfiguration: NOTION_SYNC_SECRET missing.' }, { status: 500 });
    }

    if (secret !== validSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Input Validation
    if (mode !== 'pull' && mode !== 'push') {
        return NextResponse.json({ error: 'Invalid mode. Must be "pull" or "push".' }, { status: 400 });
    }

    // Validate table against whitelist if provided
    if (table) {
        try {
            const mapPath = path.join(process.cwd(), 'scripts', 'table_to_notion_map.json');
            // Check if file exists to ensure we can validate
            if (fs.existsSync(mapPath)) {
                const tableMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
                if (!Object.keys(tableMap).includes(table)) {
                     return NextResponse.json({ error: 'Invalid table name.' }, { status: 400 });
                }
            } else {
                console.warn('table_to_notion_map.json not found, falling back to alphanumeric validation.');
                // Fallback validation: strict alphanumeric only to prevent injection if file is missing
                if (!/^[a-zA-Z0-9_]+$/.test(table)) {
                    return NextResponse.json({ error: 'Invalid table name format.' }, { status: 400 });
                }
            }
        } catch (e) {
            console.error('Error validating table:', e);
            // Fail securely if validation fails
            return NextResponse.json({ error: 'Internal server error during validation.' }, { status: 500 });
        }
    }

    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');

        // Prepare arguments for execFile
        const args = [scriptPath, mode];
        if (table) {
            args.push(table);
        }

        console.log(`Executing sync command with args:`, args);

        // Use execFile to prevent command injection
        // We use process.execPath to ensure we use the same node binary
        execFile(process.execPath, args, {
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
