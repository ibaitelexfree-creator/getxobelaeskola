import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, locale } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = createClient();

        // 1. Try to insert. If table doesn't exist, this will fail.
        // We handle the error gracefully.
        const { error } = await supabase
            .from('newsletter_subscriptions')
            .insert([{ email, locale: locale || 'es' }]);

        if (error) {
            // Check for unique constraint violation (already subscribed)
            if (error.code === '23505') {
                // We count this as success to not leak email existence or just be nice
                return NextResponse.json({ success: true, message: 'Already subscribed' });
            }

            console.error('Newsletter sub error:', error);
            return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter sub unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
