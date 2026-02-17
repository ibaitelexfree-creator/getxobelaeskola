import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/resend';
import { rentalTemplate, inscriptionTemplate, membershipTemplate, internalOrderNotificationTemplate } from '@/lib/email-templates';
import { logToExternalWebhook } from '@/lib/external-logger';
import { createRentalGoogleEvent } from '@/lib/google-calendar';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const STAFF_EMAIL = 'getxobelaeskola@gmail.com'; // Default staff contact

export async function GET() {
    return NextResponse.json({ message: 'Webhook endpoint is active' });
}

export async function POST(request: Request) {
    const supabase = createAdminClient();
    try {
        const body = await request.text();
        const signature = headers().get('stripe-signature') as string;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: unknown) {
            const errorMessage = (err as Error).message;
            console.error(`Webhook Signature verification failed: ${errorMessage}`);
            return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
        }

        // 1. Idempotency Check (Robust: skip if table missing)
        try {
            const { data: existingEvent, error: checkError } = await supabase
                .from('processed_webhook_events')
                .select('id')
                .eq('stripe_event_id', event.id)
                .maybeSingle();

            if (checkError && checkError.code !== 'PGRST204' && checkError.code !== 'PGRST205') {
                console.warn(`⚠️ Warning: Idempotency check failed (possibly table missing): ${checkError.message}`);
            }

            if (existingEvent) {
                console.log(`--- WEBHOOK DUPLICATE DETECTED: ${event.id} ---`);
                return NextResponse.json({ received: true, duplicate: true });
            }
        } catch (e) {
            console.warn('⚠️ Critical Error during idempotency check:', e);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const metadata = session.metadata;

                if (!metadata) {
                    console.error('No metadata found in session');
                    return NextResponse.json({ error: 'No metadata found' }, { status: 400 });
                }

                const { mode, user_id } = metadata;

                if (mode === 'subscription') {
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;

                    console.log('--- MEMBERSHIP COMPLETED ---', { user_id, subscriptionId });

                    if (user_id) {
                        // Profile update (legacy sync)
                        await supabase
                            .from('profiles')
                            .update({
                                stripe_customer_id: customerId,
                                stripe_subscription_id: subscriptionId,
                                status_socio: 'activo',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', user_id);

                        // Subscription table record
                        await supabase.from('subscriptions').upsert({
                            user_id: user_id,
                            stripe_subscription_id: subscriptionId,
                            stripe_customer_id: customerId,
                            status: 'active', // Will be confirmed by invoice.paid but here we init
                            created_at: new Date().toISOString()
                        }, { onConflict: 'stripe_subscription_id' });

                        await logToExternalWebhook('subscription.completed', { user_id, subscriptionId, customerId });

                        if (resend && user_id) {
                            const { data: profile } = await supabase.from('profiles').select('email, nombre').eq('id', user_id).single();
                            if (profile?.email) {
                                resend.emails.send({
                                    from: DEFAULT_FROM_EMAIL,
                                    to: profile.email,
                                    subject: (metadata.locale === 'fr' ? 'Vous êtes maintenant membre !' : (metadata.locale === 'en' ? 'You are now a Member!' : (metadata.locale === 'eu' ? 'Dagoeneko Bazkide zara!' : '¡Ya eres Socio!'))) + ' - Getxo Sailing School',
                                    html: membershipTemplate(profile.nombre || 'Navegante', (metadata.locale || 'es') as any)
                                }).catch(e => console.error('Error sending membership email:', e));

                                // Notify Staff
                                resend.emails.send({
                                    from: DEFAULT_FROM_EMAIL,
                                    to: STAFF_EMAIL,
                                    subject: `🛎️ NUEVA MEMBRESÍA: ${profile.nombre || 'Cliente'}`,
                                    html: internalOrderNotificationTemplate('membership', {
                                        userName: profile.nombre,
                                        itemName: 'Socio Mensual',
                                        amount: 20,
                                        sessionId: session.id
                                    })
                                }).catch(e => console.error('Staff notification error:', e));
                            }
                        }
                    }
                } else if (mode === 'rental_test') {
                    const { service_id, option_index, reserved_date, reserved_time } = metadata;

                    // 1. Idempotency Check for specific record
                    const { data: existingRental } = await supabase
                        .from('reservas_alquiler')
                        .select('id')
                        .eq('stripe_session_id', session.id)
                        .maybeSingle();

                    if (existingRental) {
                        console.log('--- RENTAL ALREADY PROCESSED ---', session.id);
                        return NextResponse.json({ received: true });
                    }

                    const { data: service } = await supabase.from('servicios_alquiler').select('*').eq('id', service_id).single();
                    const optionLabel = (option_index && service?.opciones[parseInt(option_index)])
                        ? service.opciones[parseInt(option_index)].label
                        : 'Estándar';

                    // Extract coupon/promotion code
                    const discounts = (session as any).total_details?.breakdown?.discounts;
                    const usedCoupon = discounts?.[0]?.discount?.promotion_code?.code || discounts?.[0]?.discount?.coupon?.id;

                    await supabase.from('reservas_alquiler').insert({
                        perfil_id: user_id,
                        servicio_id: service_id,
                        fecha_reserva: reserved_date || new Date().toISOString().split('T')[0],
                        hora_inicio: reserved_time || '10:00:00',
                        duracion_horas: 1,
                        opcion_seleccionada: optionLabel,
                        monto_total: session.amount_total ? session.amount_total / 100 : 0,
                        estado_pago: 'pagado',
                        stripe_session_id: session.id,
                        cupon_usado: usedCoupon || null
                    });

                    await logToExternalWebhook('rental.completed', {
                        user_id,
                        service_name: service?.nombre_es,
                        date: reserved_date,
                        time: reserved_time,
                        amount: session.amount_total ? session.amount_total / 100 : 0
                    });

                    if (resend && user_id) {
                        const { data: profile } = await supabase.from('profiles').select('email, nombre').eq('id', user_id).single();
                        if (profile?.email) {
                            const rentalSubject = metadata.locale === 'fr' ? `Confirmation : Location de ${service?.nombre_es || 'Équipement'}` :
                                metadata.locale === 'en' ? `Confirmation: Rental of ${service?.nombre_es || 'Equipment'}` :
                                    metadata.locale === 'eu' ? `Baieztapena: ${service?.nombre_es || 'Ekipoa'} alokairua` :
                                        `Confirmación: Alquiler de ${service?.nombre_es || 'Equipo'}`;

                            resend.emails.send({
                                from: DEFAULT_FROM_EMAIL,
                                to: profile.email,
                                subject: rentalSubject,
                                html: rentalTemplate(service?.nombre_es || 'Equipo', reserved_date || 'Hoy', reserved_time || '10:00', profile.nombre || 'Navegante', (metadata.locale || 'es') as any)
                            }).catch(e => console.error('Error sending email:', e));

                            // Notify Staff
                            resend.emails.send({
                                from: DEFAULT_FROM_EMAIL,
                                to: STAFF_EMAIL,
                                subject: `🛶 NUEVO ALQUILER: ${service?.nombre_es || 'Equipo'} - ${profile?.nombre || 'Cliente'}`,
                                html: internalOrderNotificationTemplate('rental', {
                                    userName: profile?.nombre,
                                    itemName: service?.nombre_es,
                                    amount: session.amount_total ? session.amount_total / 100 : 0,
                                    date: reserved_date,
                                    time: reserved_time,
                                    sessionId: session.id
                                })
                            }).catch(e => console.error('Staff notification error:', e));
                        }

                        // NEW: Google Calendar Sync for Staff
                        try {
                            const rentalData = {
                                fecha_reserva: reserved_date,
                                hora_inicio: reserved_time,
                                duracion_horas: 1, // Default duration, could be extracted from option if needed
                                opcion_seleccionada: optionLabel,
                                monto_total: session.amount_total ? session.amount_total / 100 : 0
                            };
                            await createRentalGoogleEvent(
                                rentalData,
                                service?.nombre_es || 'Equipo',
                                profile?.nombre || 'Cliente'
                            );
                        } catch (calErr) {
                            console.error('Error syncing rental to Google Calendar:', calErr);
                        }
                    }
                } else {
                    // Handling Course Inscriptions
                    const { course_id, edition_id, start_date, end_date } = metadata;

                    // 1. Idempotency Check for specific record
                    const { data: existingIns } = await supabase
                        .from('inscripciones')
                        .select('id')
                        .eq('stripe_session_id', session.id)
                        .maybeSingle();

                    if (existingIns) {
                        console.log('--- INSCRIPTION ALREADY PROCESSED ---', session.id);
                        return NextResponse.json({ received: true });
                    }

                    // 2. Anomaly Check: Is already enrolled?
                    const { data: alreadyEnrolled } = await supabase
                        .from('inscripciones')
                        .select('id')
                        .eq('perfil_id', user_id)
                        .eq('curso_id', course_id)
                        .eq('edicion_id', edition_id || null)
                        .eq('estado_pago', 'pagado')
                        .maybeSingle();

                    if (alreadyEnrolled) {
                        console.warn(`🚨 ANOMALY: User ${user_id} already enrolled in course ${course_id}. Session: ${session.id}`);
                        await logToExternalWebhook('anomaly.duplicate_inscription', { user_id, course_id, session_id: session.id });
                    }

                    // Extract coupon/promotion code
                    const discounts = (session as any).total_details?.breakdown?.discounts;
                    const usedCoupon = discounts?.[0]?.discount?.promotion_code?.code || discounts?.[0]?.discount?.coupon?.id;

                    await supabase.from('inscripciones').insert({
                        perfil_id: user_id,
                        curso_id: course_id,
                        edicion_id: (edition_id && edition_id !== '' && !edition_id.startsWith('test-') && !edition_id.startsWith('ext_')) ? edition_id : null,
                        estado_pago: 'pagado',
                        monto_total: session.amount_total ? session.amount_total / 100 : 0,
                        stripe_session_id: session.id,
                        metadata: { start_date, end_date },
                        cupon_usado: usedCoupon || null
                    });

                    if (edition_id && edition_id !== '' && !edition_id.startsWith('test-') && !edition_id.startsWith('ext_')) {
                        const { data: edData } = await supabase.from('ediciones_curso').select('plazas_ocupadas').eq('id', edition_id).single();
                        if (edData) {
                            await supabase.from('ediciones_curso').update({ plazas_ocupadas: (edData.plazas_ocupadas || 0) + 1 }).eq('id', edition_id);
                        }
                    }

                    const { data: course } = await supabase.from('cursos').select('nombre_es').eq('id', course_id).single();
                    await logToExternalWebhook('course.inscription.completed', {
                        user_id,
                        course_name: course?.nombre_es,
                        amount: session.amount_total ? session.amount_total / 100 : 0
                    });

                    if (resend && user_id) {
                        const { data: profile } = await supabase.from('profiles').select('email, nombre').eq('id', user_id).single();
                        const { data: course } = await supabase.from('cursos').select('nombre_es').eq('id', course_id).single();
                        if (profile?.email) {
                            const insSubject = metadata.locale === 'fr' ? `Inscription confirmée : ${course?.nombre_es || 'Cours'}` :
                                metadata.locale === 'en' ? `Enrollment Confirmed: ${course?.nombre_es || 'Course'}` :
                                    metadata.locale === 'eu' ? `Izen-ematea baieztatuta: ${course?.nombre_es || 'Ikastaroa'}` :
                                        `Inscripción Confirmada: ${course?.nombre_es || 'Curso'}`;

                            resend.emails.send({
                                from: DEFAULT_FROM_EMAIL,
                                to: profile.email,
                                subject: insSubject,
                                html: inscriptionTemplate(course?.nombre_es || 'Curso', profile.nombre || 'Alumno', (metadata.locale || 'es') as any)
                            }).catch(e => console.error('Error sending email:', e));

                            // Notify Staff
                            resend.emails.send({
                                from: DEFAULT_FROM_EMAIL,
                                to: STAFF_EMAIL,
                                subject: `🎓 NUEVA INSCRIPCIÓN: ${course?.nombre_es || 'Curso'} - ${profile?.nombre || 'Alumno'}`,
                                html: internalOrderNotificationTemplate('course', {
                                    userName: profile?.nombre,
                                    itemName: course?.nombre_es,
                                    amount: session.amount_total ? session.amount_total / 100 : 0,
                                    sessionId: session.id
                                })
                            }).catch(e => console.error('Staff notification error:', e));
                        }
                    }
                }
                break;
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object as any;
                const userId = subscription.metadata?.user_id;

                console.log('--- SUBSCRIPTION CREATED ---', { sub_id: subscription.id, user_id: userId });

                if (userId) {
                    // One Active Subscription Policy
                    const { data: activeSubs } = await supabase
                        .from('subscriptions')
                        .select('id, stripe_subscription_id')
                        .eq('user_id', userId)
                        .eq('status', 'active');

                    if (activeSubs && activeSubs.length > 0) {
                        console.warn(`🚨 ANOMALY: User ${userId} already has active subscription(s). New sub created: ${subscription.id}`);
                        await logToExternalWebhook('anomaly.duplicate_subscription', {
                            user_id: userId,
                            new_subscription_id: subscription.id,
                            existing_subscriptions: activeSubs
                        });
                        // In a real production scenario, we might call stripe.subscriptions.cancel(subscription.id) here.
                    }

                    await supabase.from('subscriptions').upsert({
                        user_id: userId,
                        stripe_subscription_id: subscription.id,
                        stripe_customer_id: subscription.customer as string,
                        status: subscription.status,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        metadata: subscription.metadata
                    }, { onConflict: 'stripe_subscription_id' });
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    console.log(`--- SUBSCRIPTION PAID: ${subscriptionId} ---`);

                    // Update subscriptions table
                    const { data: subData } = await supabase
                        .from('subscriptions')
                        .update({
                            status: 'active',
                            current_period_end: new Date(invoice.period_end * 1000).toISOString()
                        })
                        .eq('stripe_subscription_id', subscriptionId)
                        .select('user_id')
                        .single();

                    // Legacy profile update
                    if (subData?.user_id) {
                        await supabase
                            .from('profiles')
                            .update({
                                status_socio: 'activo',
                                fecha_fin_periodo: new Date(invoice.period_end * 1000).toISOString()
                            })
                            .eq('id', subData.user_id);

                        await logToExternalWebhook('invoice.paid', { user_id: subData.user_id, subscriptionId });
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                console.log('--- SUBSCRIPTION UPDATED ---', subscription.id);

                const statusMap: Record<string, string> = {
                    'active': 'active',
                    'past_due': 'past_due',
                    'unpaid': 'unpaid',
                    'canceled': 'canceled',
                    'incomplete': 'incomplete'
                };

                const dbStatus = statusMap[subscription.status] || 'active';

                // Update subscriptions
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .update({
                        status: dbStatus,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end
                    })
                    .eq('stripe_subscription_id', subscription.id)
                    .select('user_id')
                    .single();

                // Legacy profile update
                if (subData?.user_id) {
                    await supabase
                        .from('profiles')
                        .update({
                            status_socio: subscription.status === 'active' ? 'activo' : (subscription.status === 'past_due' ? 'past_due' : 'no_socio'),
                            fecha_fin_periodo: new Date(subscription.current_period_end * 1000).toISOString()
                        })
                        .eq('id', subData.user_id);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                console.log('--- SUBSCRIPTION CANCELED ---', subscription.id);

                // Update subscriptions
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .update({ status: 'canceled' })
                    .eq('stripe_subscription_id', subscription.id)
                    .select('user_id')
                    .single();

                // Legacy profile update
                if (subData?.user_id) {
                    await supabase
                        .from('profiles')
                        .update({
                            status_socio: 'no_socio',
                            stripe_subscription_id: null
                        })
                        .eq('id', subData.user_id);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // 2. Record Event as Processed (Robust: skip if table missing)
        try {
            await supabase.from('processed_webhook_events').insert({
                stripe_event_id: event.id,
                event_type: event.type
            });
        } catch (e) {
            console.warn('⚠️ Warning: Could not record processed webhook event:', e);
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        console.error('--- WEBHOOK UNHANDLED ERROR ---', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}



