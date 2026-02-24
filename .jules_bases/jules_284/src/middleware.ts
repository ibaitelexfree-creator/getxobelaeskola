import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['es', 'eu', 'en', 'fr'],
    defaultLocale: 'es',
    localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
    const isApi = request.nextUrl.pathname.startsWith('/api');
    let response: NextResponse;

    // 1. Determine base response
    if (isApi) {
        // API routes don't use next-intl usually
        response = NextResponse.next();
    } else {
        // Run next-intl middleware for pages
        response = intlMiddleware(request);
    }

    // If it's a redirect, return it immediately
    if (response.status === 307 || response.status === 308) {
        return response;
    }

    // 2. Supabase session logic
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        // Ignore auth errors during middleware (e.g. if Supabase is unreachable)
        console.error('Middleware auth check failed:', e);
    }

    // 3. Token Metering Logic (Identify Tenant)
    // Try to get tenant from header (e.g. API Gateway) or fallback to authenticated user
    let tenantId = request.headers.get('x-tenant-id');
    if (!tenantId && user) {
        tenantId = user.id;
    }

    // If we identified a tenant for an API route, inject it into request headers
    if (isApi && tenantId) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-metering-tenant-id', tenantId);

        // Create a new response with the modified request headers
        const newResponse = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        // Copy cookies from the original response (which might contain auth session updates)
        response.cookies.getAll().forEach((cookie) => {
            newResponse.cookies.set(cookie);
        });

        // Copy response headers
        response.headers.forEach((value, key) => {
            newResponse.headers.set(key, value);
        });

        return newResponse;
    }

    return response;
}

export const config = {
    // Include API routes to support metering logic
    matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
