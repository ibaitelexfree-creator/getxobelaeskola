
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { bonoId, locale = 'es' } = await req.json();

        // 1. Auth Check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Bono Details
        const { data: bono } = await supabase
            .from('tipos_bono')
            .select('*')
            .eq('id', bonoId)
            .single();

        if (!bono) {
            return NextResponse.json({ error: 'Bono not found' }, { status: 404 });
        }

        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
        const origin = req.headers.get('origin') || `${protocol}://${host}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: bono.nombre,
                            description: bono.descripcion || `Bono de ${bono.horas_totales} horas`,
                            images: [bono.imagen_url || 'https://getxobelaeskola.cloud/images/home-hero-sailing-action.webp'],
                            metadata: {
                                type: 'bono_horas',
                                bono_id: bono.id,
                                horas_totales: bono.horas_totales,
                            },
                        },
                        unit_amount: Math.round(bono.precio * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/${locale}/student/dashboard?checkout_success=true&bono_id=${bono.id}`,
            cancel_url: `${origin}/${locale}/student/dashboard?checkout_cancel=true`,
            metadata: {
                purchase_type: 'bono_horas',
                user_id: user.id,
                bono_id: bono.id,
                horas: bono.horas_totales
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
