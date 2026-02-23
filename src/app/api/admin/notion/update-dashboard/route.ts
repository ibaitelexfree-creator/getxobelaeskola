import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST() {
    const { error } = await requireAdmin();
    if (error) {
        return error;
    }

    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'notion-premium-dashboard.js');
        // Child process inherits env, but we make sure NOTION_TOKEN is there

        execFile(process.execPath, [scriptPath], {
            env: {
                ...process.env,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                NOTION_TOKEN: process.env.NOTION_TOKEN || ''
            }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Dashboard Update Error:', stderr);
                resolve(NextResponse.json({ error: stderr || 'Execution failed' }, { status: 500 }));
                return;
            }
            resolve(NextResponse.json({ success: true, output: stdout }));
        });
    });
}
