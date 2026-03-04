import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/constants'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { syncUser } = await import('@/lib/user-sync')
                await syncUser(user)
            }

            const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')
            const appUrl = isLocal ? origin : (process.env.NEXT_PUBLIC_APP_URL || origin)

            // Ensure appUrl doesn't end with a slash to prevent double slashes
            const cleanAppUrl = appUrl.replace(/\/$/, '')
            const redirectUrl = `${cleanAppUrl}${BASE_PATH}${next}`

            return NextResponse.redirect(redirectUrl)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}${BASE_PATH}/auth/auth-code-error`)
}
