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
    // console.log('--- WEBHOOK HIT ---');
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
            console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
            return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
        }

        const supabase = createAdminClient();

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata) {
                console.error('No metadata found in session');
                return NextResponse.json({ error: 'No metadata found' }, { status: 400 });
            }

            const { user_id, edition_id, course_id, mode, start_date, end_date, service_id, option_index, reserved_date, reserved_time } = metadata;

            // Handle Rental or Course
            if (mode === 'rental_test') {

                // 1. Get Service for option label
                const { data: service } = await supabase
                    .from('servicios_alquiler')
                    .select('*')
                    .eq('id', service_id)
                    .single();

                const optionLabel = (option_index && service?.opciones[parseInt(option_index)])
                    ? service.opciones[parseInt(option_index)].label
                    : 'Estándar';

                // 2. Register the rental
                const { error: rentError } = await supabase
                    .from('reservas_alquiler')
                    .insert({
                        perfil_id: user_id,
                        servicio_id: service_id,
                        fecha_reserva: reserved_date || new Date().toISOString().split('T')[0], // Simplified for test
                        hora_inicio: reserved_time || '10:00:00',
                        duracion_horas: 1,
                        opcion_seleccionada: optionLabel,
                        monto_total: session.amount_total ? session.amount_total / 100 : 0,
                        estado_pago: 'pagado',
                        stripe_session_id: session.id
                    });

                if (rentError) {
                    console.error('--- RENTAL DB ERROR ---', rentError);
                    return NextResponse.json({ error: 'Rental DB Error' }, { status: 500 });
                }

                // 3. Send Confirmation Email (Async)
                if (resend) {
                    const { data: profile } = await supabase.from('profiles').select('email, nombre').eq('id', user_id).single();
                    if (profile?.email) {
                        resend.emails.send({
                            from: DEFAULT_FROM_EMAIL,
                            to: profile.email,
                            subject: `Confirmación: Alquiler de ${service?.nombre_es || 'Equipo'}`,
                            html: rentalTemplate(service?.nombre_es || 'Equipo', reserved_date || 'Hoy', reserved_time || '10:00', profile.nombre || 'Navegante')
                        }).catch(e => console.error('Error sending rental email:', e));
                    }
                }

                return NextResponse.json({ received: true });
            } else {
                // Handling Inscriptions

                // console.log('--- PAYMENT SUCCESSFUL ---', { user_id, edition_id, course_id });

                // 1. Register the inscription
                const { error: insError } = await supabase
                    .from('inscripciones')
                    .insert({
                        perfil_id: user_id,
                        curso_id: course_id,
                        edicion_id: (edition_id && (edition_id.startsWith('test-') || edition_id.startsWith('ext_'))) ? null : edition_id,
                        estado_pago: 'pagado',
                        monto_total: session.amount_total ? session.amount_total / 100 : 0,
                        stripe_session_id: session.id,
                        metadata: {
                            start_date: start_date,
                            end_date: end_date
                        }
                    });

                if (insError) {
                    console.error('--- DB INSERT ERROR ---', insError);
                    return NextResponse.json({ error: 'DB Error' }, { status: 500 });
                }

                // 2. Update occupancy (if it's a real edition)
                if (edition_id && !edition_id.startsWith('test-')) {
                    const { data: edData } = await supabase
                        .from('ediciones_curso')
                        .select('plazas_ocupadas')
                        .eq('id', edition_id)
                        .single();

                    if (edData) {
                        await supabase
                            .from('ediciones_curso')
                            .update({ plazas_ocupadas: (edData.plazas_ocupadas || 0) + 1 })
                            .eq('id', edition_id);
                    }
                }

                // 3. Send Confirmation Email (Async)
                if (resend) {
                    const { data: profile } = await supabase.from('profiles').select('email, nombre').eq('id', user_id).single();
                    const { data: course } = await supabase.from('cursos').select('nombre_es').eq('id', course_id).single();
                    if (profile?.email) {
                        resend.emails.send({
                            from: DEFAULT_FROM_EMAIL,
                            to: profile.email,
                            subject: `Inscripción Confirmada: ${course?.nombre_es || 'Curso de Navegación'}`,
                            html: inscriptionTemplate(course?.nombre_es || 'Curso', profile.nombre || 'Alumno')
                        }).catch(e => console.error('Error sending inscription email:', e));
                    }
                }

                return NextResponse.json({ received: true });
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        console.error('--- WEBHOOK UNHANDLED ERROR ---');
        console.error(err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}


