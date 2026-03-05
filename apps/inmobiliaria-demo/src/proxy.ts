import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()

    // Proteger rutas de admin
    if (url.pathname.startsWith('/admin')) {
        if (!user) {
            url.pathname = '/auth/login'
            url.searchParams.set('returnTo', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }

        // Aquí idealmente deberíamos chequear el rol, pero en el middleware
        // no siempre es fácil si no está en el token.
        // Al menos está protegido por usuario auth.
    }

    // Similar protección para /dashboard y /list-property si se requieren logueados
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/list-property')) {
        if (!user) {
            url.pathname = '/auth/login'
            url.searchParams.set('returnTo', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }
    }

    // Si un usuario ya logueado intenta ir a auth/login, lo mandamos al index
    if (url.pathname.startsWith('/auth/login') && user) {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
