
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    // 1. Authentication Check
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const expectedSecret = process.env.NOTION_SYNC_SECRET || 'getxo_notion_sync_2026_pro';

    let isAuthorized = false;

    if (user) {
        // If logged in, check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .single();

        if (profile?.rol === 'admin') {
            isAuthorized = true;
        }
    }

    if (!isAuthorized && secret === expectedSecret) {
        isAuthorized = true;
    }

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Inputs
    let direction, table;
    try {
        const body = await req.json();
        direction = body.direction || 'pull';
        table = body.table || '';
    } catch (e) {
        // Fallback to query params if JSON body is missing
        direction = searchParams.get('direction') || 'pull';
        table = searchParams.get('table') || '';
    }

    if (direction !== 'pull' && direction !== 'push') {
        return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }

    if (table && !/^[a-z0-9_]+$/.test(table)) {
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    // 3. Execute script safely
    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');

        console.log(`Executing admin sync: direction=${direction}, table=${table}`);

        const child = spawn('node', [scriptPath, direction, table], {
            env: {
                ...process.env,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                NOTION_TOKEN: process.env.NOTION_TOKEN || ''
            }
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data;
            console.log(`Sync script output: ${data}`);
        });

        child.stderr.on('data', (data) => {
            stderr += data;
            console.error(`Sync script stderr: ${data}`);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`Sync process exited with code ${code}`);
                resolve(NextResponse.json({ error: stderr || 'Execution failed', code }, { status: 500 }));
            } else {
                resolve(NextResponse.json({ output: stdout }));
            }
        });

        child.on('error', (err) => {
            console.error('Failed to start sync process:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        });
    });
}
