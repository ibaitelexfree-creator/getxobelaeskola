
import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(req: Request) {
    // 1. Authentication
    const authResult = await requireAdmin();
    if (authResult.error) {
        return authResult.error;
    }

    const { direction = 'pull', table } = await req.json();

    // 2. Input Validation
    if (direction !== 'pull' && direction !== 'push') {
        return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }

    const mapPath = path.join(process.cwd(), 'scripts', 'table_to_notion_map.json');
    let allowedTables: string[] = [];
    try {
        const mapContent = fs.readFileSync(mapPath, 'utf8');
        allowedTables = Object.keys(JSON.parse(mapContent));
    } catch (error) {
        console.error('Failed to load table map:', error);
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (table && !allowedTables.includes(table)) {
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');

        // 3. Safe Execution using execFile
        const args = [scriptPath, direction];
        if (table) {
            args.push(table);
        }

        execFile(process.execPath, args, {
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
}
