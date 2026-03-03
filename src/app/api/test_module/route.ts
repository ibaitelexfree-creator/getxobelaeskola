
import { NextResponse } from 'next/server';

export async function GET() {
    console.log('[API-DEBUG] Test route hit!');
    return NextResponse.json({ message: 'It works!' });
}
