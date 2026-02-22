import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { StripeHandlers } from '@/lib/stripe/webhook-handlers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function GET() {
    return NextResponse.json({ message: 'Stripe Webhook Endpoint is Running' });
}

export async function POST(request: Request) {
    const supabase = createAdminClient();
    const handlers = new StripeHandlers(supabase);

    try {
        const body = await request.text();
        const signature = headers().get('stripe-signature') as string;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: unknown) {
            console.error(`❌ Webhook Signature failed: ${(err as Error).message}`);
            return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
        }

        console.log(`🛎️  WEBHOOK RECEIVED: ${event.type} [${event.id}]`);

        // 1. Audit Log (Source of Truth)
        // We try-catch this because if the table doesn't exist yet, we still want to process the payment
        let auditLogId: string | null = null;
        try {
            const { data: auditLog } = await supabase
                .from('stripe_audit_logs')
                .insert({
                    stripe_event_id: event.id,
                    event_type: event.type,
                    payload: event,
                    status: 'pending'
                })
                .select('id')
                .single();
            auditLogId = auditLog?.id;
        } catch (auditError) {
            console.warn(`⚠️ Audit Log Table Missing or Error:`, auditError);
        }

        // 2. Idempotency Check (processed_webhook_events)
        const { data: existingEvent } = await supabase
            .from('processed_webhook_events')
            .select('id')
            .eq('stripe_event_id', event.id)
            .maybeSingle();

        if (existingEvent) {
            console.log(`♻️  DUPLICATE EVENT: ${event.id} (Skipping)`);
            return NextResponse.json({ received: true, duplicate: true });
        }

        // 3. Main Processing Logic
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    await handlers.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                    break;

                case 'invoice.paid': {
                    const invoice = event.data.object as any;
                    const subscriptionId = invoice.subscription as string;
                    if (subscriptionId) {
                        const { data: subData } = await supabase
                            .from('subscriptions')
                            .update({
                                status: 'active',
                                current_period_end: new Date(invoice.period_end * 1000).toISOString()
                            })
                            .eq('stripe_subscription_id', subscriptionId)
                            .select('user_id')
                            .single();

                        if (subData?.user_id) {
                            await supabase.from('profiles').update({
                                status_socio: 'activo',
                                fecha_fin_periodo: new Date(invoice.period_end * 1000).toISOString()
                            }).eq('id', subData.user_id);
                        }
                    }
                    break;
                }

                case 'customer.subscription.updated':
                    await handlers.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                    break;

                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as any;
                    const { data: subData } = await supabase
                        .from('subscriptions')
                        .update({ status: 'canceled' })
                        .eq('stripe_subscription_id', subscription.id)
                        .select('user_id')
                        .single();

                    if (subData?.user_id) {
                        await supabase.from('profiles').update({
                            status_socio: 'no_socio',
                            stripe_subscription_id: null
                        }).eq('id', subData.user_id);
                    }
                    break;
                }

                case 'invoice.payment_failed':
                    console.warn(`⚠️  PAYMENT FAILED for session: ${(event.data.object as any).id}`);
                    // (Additional logic can be added to handlers to notify users)
                    break;

                case 'payment_intent.payment_failed':
                    await handlers.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                    break;

                default:
                    console.log(`ℹ️  Unhandled event type: ${event.type}`);
            }

            // 4. Mark as Processed (Idempotency)
            await supabase.from('processed_webhook_events').insert({
                stripe_event_id: event.id,
                event_type: event.type
            });

            // 5. Update Audit Log
            if (auditLogId) {
                await supabase.from('stripe_audit_logs')
                    .update({ status: 'processed', processed_at: new Date().toISOString() })
                    .eq('id', auditLogId);
            }

        } catch (processError) {
            console.error(`💥 ERROR PROCESSING EVENT ${event.type}:`, processError);

            if (auditLogId) {
                await supabase.from('stripe_audit_logs')
                    .update({ status: 'failed', error_message: (processError as Error).message })
                    .eq('id', auditLogId);
            }

            // Return 500 so Stripe retries
            return NextResponse.json({ error: (processError as Error).message }, { status: 500 });
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        console.error('🔥 CRITICAL WEBHOOK ERROR:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
