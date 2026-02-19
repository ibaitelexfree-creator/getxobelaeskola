import { NextResponse } from 'next/server';

export async function GET() {
    // Placeholder for achievements logic.
    // In the future, this should fetch unlocked achievements from the DB.
    // For now, returning an empty array to prevent client-side errors.
    return NextResponse.json([]);
}
