import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['es', 'eu', 'en'],
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
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    await supabase.auth.getUser();

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
