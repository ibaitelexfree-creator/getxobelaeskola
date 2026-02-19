
import { NextResponse } from 'next/server';
import { listFiles } from '@/lib/google-drive';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId') || undefined;

    try {
        const files = await listFiles(folderId);
        return NextResponse.json({ files });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
