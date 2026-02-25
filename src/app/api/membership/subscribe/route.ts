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
        if (authError || !user) return authError || NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

        // 1. Get user profile and check for active subscriptions
        const { data: profile } = await supabase
            .from('profiles')
            .select('nombre, apellidos, stripe_customer_id, status_socio')
            .eq('id', user.id)
            .single();

        // Check truth in subscriptions table
        const { data: activeSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

        if (profile?.status_socio === 'activo' || activeSub) {
            return NextResponse.json({ error: 'Ya eres socio activo' }, { status: 400 });
        }

        const itemName = locale === 'es' ? 'Socio Getxo Bela Eskola' : 'Getxo Bela Eskolako Bazkidea';

        // 2. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            allow_promotion_codes: true,
            customer: profile?.stripe_customer_id || undefined,
            customer_email: profile?.stripe_customer_id ? undefined : user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: itemName,
                            description: locale === 'es' ? 'Cuota mensual de socio (20€/mes)' : 'Hilabeteko bazkide kuota (20€/hilabete)',
                        },
                        unit_amount: 2000,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/${locale}/student/payment-success?session_id={CHECKOUT_SESSION_ID}&type=membership`,
            cancel_url: `${origin}/${locale}/student/dashboard?membership=canceled`,
            metadata: {
                user_id: user.id as string,
                user_name: profile?.nombre ? `${profile.nombre} ${profile.apellidos || ''}` : (user.email as string),
                item_name: itemName,
                stripe_product_id: 'prod_TyXb9W8QGiDJPw',
                locale: (locale as string) || 'es',
                mode: 'subscription'
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('Stripe Membership Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
