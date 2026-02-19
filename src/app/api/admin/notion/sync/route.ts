
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    const { direction = 'pull', table } = await req.json();

    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'supabase-notion-bridge.js');
        const command = `node ${scriptPath} ${direction} ${table || ''}`;

        exec(command, {
            env: {
                ...process.env,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                NOTION_TOKEN: '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'
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
