import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['es', 'eu', 'en', 'fr'],
    defaultLocale: 'es',
    localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware first
    const response = intlMiddleware(request);

    // If it's a redirect, return it immediately
    if (response.status === 307 || response.status === 308) {
        return response;
    }

    // 2. Supabase session logic
    // Gracefully handle missing env vars to prevent build crashes
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

    const supabase = createServerClient(
        url,
        key,
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

    // Only attempt auth check if we have valid keys (or at least placeholders that won't crash constructor)
    // Note: placeholder keys might cause auth.getUser() to fail, but it shouldn't crash the middleware completely.
    try {
        await supabase.auth.getUser();
    } catch (e) {
        // Ignore auth errors during middleware execution if config is missing
        if (process.env.NODE_ENV === 'development') {
            console.warn('Supabase auth check failed in middleware:', e);
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
