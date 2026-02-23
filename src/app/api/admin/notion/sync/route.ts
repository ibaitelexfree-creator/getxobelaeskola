
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(req: Request) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { direction = 'pull', table } = await req.json();

    // 1. Validate direction
    if (!['pull', 'push'].includes(direction)) {
        return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }

    // 2. Validate table if provided
    if (table) {
        try {
            const mapPath = path.join(process.cwd(), 'scripts', 'table_to_notion_map.json');
            const tableMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
            if (!tableMap[table]) {
                return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
            }
        } catch (e) {
            console.error('Error reading table map:', e);
            return NextResponse.json({ error: 'Internal configuration error' }, { status: 500 });
        }
    }

    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');
        const args = [scriptPath, direction];
        if (table) args.push(table);

        const child = spawn('node', args, {
            env: {
                ...process.env,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                NOTION_TOKEN: process.env.NOTION_TOKEN || ''
            }
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error('Sync Error:', stderr);
                resolve(NextResponse.json({ error: stderr || `Process exited with code ${code}` }, { status: 500 }));
                return;
            }
            resolve(NextResponse.json({ output: stdout }));
        });
    });
}
