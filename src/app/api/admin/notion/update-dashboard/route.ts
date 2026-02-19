
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'notion-premium-dashboard.js');
        // Child process inherits env, but we make sure NOTION_TOKEN is there
        const command = `node ${scriptPath}`;

        exec(command, {
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
