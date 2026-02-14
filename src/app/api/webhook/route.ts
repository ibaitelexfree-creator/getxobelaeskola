import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/resend';
import { rentalTemplate, inscriptionTemplate } from '@/lib/email-templates';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing');
            return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
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
                    // 1. Link Subscription to User
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;

                    console.log('--- MEMBERSHIP COMPLETED ---', { user_id, subscriptionId });

                    if (user_id) {
                        const { error: upError } = await supabase
                            .from('profiles')
                            .update({
                                stripe_customer_id: customerId,
                                stripe_subscription_id: subscriptionId,
                                status_socio: 'activo',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', user_id);

                        if (upError) console.error('Error updating profile with subscription:', upError);
                    }
                } else if (mode === 'rental_test') {
                    // ... existing rental logic ...
                    const { service_id, option_index, reserved_date, reserved_time } = metadata;
                    const { data: service } = await supabase.from('servicios_alquiler').select('*').eq('id', service_id).single();
                    const optionLabel = (option_index && service?.opciones[parseInt(option_index)])
                        ? service.opciones[parseInt(option_index)].label
                        : 'Estándar';

                    const { error: rentError } = await supabase.from('reservas_alquiler').insert({
                        perfil_id: user_id,
                        servicio_id: service_id,
                        fecha_reserva: reserved_date || new Date().toISOString().split('T')[0],
                        hora_inicio: reserved_time || '10:00:00',
                        duracion_horas: 1,
                        opcion_seleccionada: optionLabel,
                        monto_total: session.amount_total ? session.amount_total / 100 : 0,
                        estado_pago: 'pagado',
                        stripe_session_id: session.id
                    });

                    if (rentError) console.error('Rental DB Error:', rentError);

                    if (resend && user_id) {
                        const { data: profile } = await supabase.from('profiles').select('email, nombre').eq('id', user_id).single();
                        if (profile?.email) {
                            resend.emails.send({
                                from: DEFAULT_FROM_EMAIL,
                                to: profile.email,
                                subject: `Confirmación: Alquiler de ${service?.nombre_es || 'Equipo'}`,
                                html: rentalTemplate(service?.nombre_es || 'Equipo', reserved_date || 'Hoy', reserved_time || '10:00', profile.nombre || 'Navegante')
                            }).catch(e => console.error('Error sending email:', e));
                        }
                    }
                } else if (mode === 'article_sale') {
                    // ... (existing article logic placeholder) ...
                    console.log('--- ARTICLE SALE COMPLETED ---', metadata);
                } else {
                    // Handling Course Inscriptions
                    const { course_id, edition_id, start_date, end_date } = metadata;
                    const { error: insError } = await supabase.from('inscripciones').insert({
                        perfil_id: user_id,
                        curso_id: course_id,
                        edicion_id: (edition_id && (edition_id.startsWith('test-') || edition_id.startsWith('ext_'))) ? null : edition_id,
                        estado_pago: 'pagado',
                        monto_total: session.amount_total ? session.amount_total / 100 : 0,
                        stripe_session_id: session.id,
                        metadata: { start_date, end_date }
                    });

                    if (insError) console.error('Inscription DB Error:', insError);

                    if (edition_id && !edition_id.startsWith('test-')) {
                        const { data: edData } = await supabase.from('ediciones_curso').select('plazas_ocupadas').eq('id', edition_id).single();
                        if (edData) {
                            await supabase.from('ediciones_curso').update({ plazas_ocupadas: (edData.plazas_ocupadas || 0) + 1 }).eq('id', edition_id);
                        }
                    }

                    if (resend && user_id) {
                        const { data: profile } = await supabase.from('profiles').select('email, nombre').eq('id', user_id).single();
                        const { data: course } = await supabase.from('cursos').select('nombre_es').eq('id', course_id).single();
                        if (profile?.email) {
                            resend.emails.send({
                                from: DEFAULT_FROM_EMAIL,
                                to: profile.email,
                                subject: `Inscripción Confirmada: ${course?.nombre_es || 'Curso'}`,
                                html: inscriptionTemplate(course?.nombre_es || 'Curso', profile.nombre || 'Alumno')
                            }).catch(e => console.error('Error sending email:', e));
                        }
                    }
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;
                const customerId = invoice.customer as string;

                if (subscriptionId) {
                    console.log(`--- SUBSCRIPTION PAID: ${subscriptionId} ---`);
                    // Update validity date
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            status_socio: 'activo',
                            fecha_fin_periodo: new Date(invoice.period_end * 1000).toISOString()
                        })
                        .eq('stripe_subscription_id', subscriptionId);

                    if (error) console.error('Error updating profile on invoice.paid:', error);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                console.log('--- SUBSCRIPTION UPDATED ---', subscription.id);

                // Status could be 'active', 'past_due', 'unpaid', 'canceled'
                const status = (subscription.status === 'active') ? 'activo' : (subscription.status === 'past_due' ? 'past_due' : 'no_socio');

                await supabase
                    .from('profiles')
                    .update({
                        status_socio: status,
                        fecha_fin_periodo: new Date(subscription.current_period_end * 1000).toISOString()
                    })
                    .eq('stripe_subscription_id', subscription.id);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('--- SUBSCRIPTION CANCELED ---', subscription.id);

                await supabase
                    .from('profiles')
                    .update({
                        status_socio: 'no_socio',
                        stripe_subscription_id: null
                    })
                    .eq('stripe_subscription_id', subscription.id);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        console.error('--- WEBHOOK UNHANDLED ERROR ---', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}


