// This endpoint has been replaced by /api/students/me/skills
// Please use the new endpoint.
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ error: 'Endpoint deprecated. Use /api/students/me/skills' }, { status: 410 });
}
