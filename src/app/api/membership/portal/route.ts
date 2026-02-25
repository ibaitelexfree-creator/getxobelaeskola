import { requireAuth } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 503 });
    }
    try {
        const { locale } = await request.json();
        const { user, supabase, error: authError } = await requireAuth();
        if (authError || !user) {
            return NextResponse.json({ error: (authError as any)?.message || 'Unauthorized' }, { status: 401 });
        }

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

        // 1. Get user profile to get stripe_customer_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: 'No se encontró historial de pagos' }, { status: 400 });
        }

        // 2. Create Billing Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${origin}/${locale}/student/membership/confirmation`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('Stripe Portal Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
