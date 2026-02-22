import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['es', 'eu', 'en', 'fr'],
    defaultLocale: 'es',
    localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
    const isApiAdmin = request.nextUrl.pathname.startsWith('/api/admin');

    // 1. Initial Response
    let response = isApiAdmin
        ? NextResponse.next({ request: { headers: request.headers } })
        : intlMiddleware(request);

    // If intlMiddleware redirects (for locale), return immediately.
    // Cookies set by Supabase haven't happened yet, so it's safe.
    if (!isApiAdmin && (response.status === 307 || response.status === 308)) {
        return response;
    }

    // 2. Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    // We modify the existing response object directly
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // 3. Always refresh session (Critical for maintaining auth state)
    // This will trigger setAll if the token is refreshed
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // 4. Security Checks for Protected Routes
    const pathname = request.nextUrl.pathname;
    const isStaffPage = /^\/(es|eu|en|fr)\/staff/.test(pathname);

    if (isApiAdmin || isStaffPage) {
        // 4.1 Unauthenticated Handling
        if (userError || !user) {
            if (isApiAdmin) {
                 const errorRes = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                 copyCookies(response, errorRes);
                 return errorRes;
            } else {
                 const locale = pathname.split('/')[1] || 'es';
                 const redirectRes = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
                 copyCookies(response, redirectRes);
                 return redirectRes;
            }
        }

        // 4.2 Role Handling
        const { data: profile } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .single();

        const isAdmin = profile?.rol === 'admin';
        const isInstructor = profile?.rol === 'instructor';

        if (!isAdmin && !isInstructor) {
            if (isApiAdmin) {
                const errorRes = NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                copyCookies(response, errorRes);
                return errorRes;
            } else {
                const locale = pathname.split('/')[1] || 'es';
                const redirectRes = NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
                copyCookies(response, redirectRes);
                return redirectRes;
            }
        }
    }

    return response;
}

// Helper to preserve cookies when returning a new response (e.g. redirect)
function copyCookies(source: NextResponse, target: NextResponse) {
    // Only copy cookies that were set on the source response (e.g. by Supabase refresh)
    // source.cookies.getAll() returns all cookies, including those parsed from request if they were copied?
    // No, NextResponse.cookies only contains set-cookie headers usually.
    // Wait, source.cookies.getAll() on a response object returns the Set-Cookie headers.
    source.cookies.getAll().forEach(cookie => {
        target.cookies.set(cookie.name, cookie.value, cookie);
    });
}

export const config = {
    // Match all pages (for intl) AND /api/admin
    matcher: ['/((?!api/(?!admin)|_next|_vercel|.*\\..*).*)']
};
