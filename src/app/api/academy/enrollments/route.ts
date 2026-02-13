
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { getUserEnrollments } from '@/lib/academy/enrollment';

export const dynamic = 'force-dynamic';

/**
 * GET /api/academy/enrollments
 * 
 * Returns the list of course IDs that the currently authenticated user
 * has successfully purchased.
 * 
 * Security:
 * - Requires authentication via session cookies.
 * - Extracts User ID strictly from the validated session.
 * - Returns only a list of IDs, no personal or payment data.
 */
export async function GET(request: Request) {
    try {
        // 1. Authentication & Identity Verification
        // allowInstructor: false (default) implies any authenticated user can access their own data
        const { user, error } = await requireAuth();

        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Data Retrieval
        // Source of truth: Server-side enrollment logic
        const courseIds = await getUserEnrollments(user.id);

        // 3. Secure Response
        // Minimal data exposure: Only IDs
        return NextResponse.json({
            enrollments: courseIds
        });

    } catch (err) {
        // 4. Fail Closed / Error Handling
        console.error('Error in /api/academy/enrollments:', err);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
