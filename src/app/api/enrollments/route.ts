import { NextResponse } from "next/server";
import { getUserEnrollments } from "@/lib/academy/enrollment";
import { corsHeaders, withCors } from "@/lib/api-headers";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/**
 * GET /api/enrollments
 *
 * Returns the list of course IDs that the currently authenticated user
 * has successfully purchased.
 */

export async function OPTIONS(request: Request) {
	return new NextResponse(null, {
		status: 204,
		headers: corsHeaders(request),
	});
}
export async function GET(request: Request) {
	try {
		// 1. Authentication & Identity Verification
		// allowInstructor: false (default) implies any authenticated user can access their own data
		const { user, error } = await requireAuth();

		if (error || !user) {
			return withCors(
				NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
				request,
			);
		}

		// 2. Data Retrieval
		// Source of truth: Server-side enrollment logic
		const courseIds = await getUserEnrollments(user.id);

		// 3. Secure Response
		// Minimal data exposure: Only IDs
		return withCors(
			NextResponse.json({
				enrollments: courseIds,
			}),
			request,
		);
	} catch (err) {
		// 4. Fail Closed / Error Handling
		console.error("Error in /api/academy/enrollments:", err);

		return withCors(
			NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
			request,
		);
	}
}
