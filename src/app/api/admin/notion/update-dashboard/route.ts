
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST() {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'notion-premium-dashboard.js');

        const child = spawn('node', [scriptPath], {
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
                console.error('Dashboard Update Error:', stderr);
                resolve(NextResponse.json({ error: stderr || `Process exited with code ${code}` }, { status: 500 }));
                return;
            }
            resolve(NextResponse.json({ success: true, output: stdout }));
        });
    });
}
