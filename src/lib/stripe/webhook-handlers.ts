import { SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { stripe } from '../stripe';
import { resend, DEFAULT_FROM_EMAIL } from '../resend';
import { rentalTemplate, inscriptionTemplate, membershipTemplate, internalOrderNotificationTemplate, paymentFailedTemplate } from '../email-templates';
import { createRentalGoogleEvent } from '../google-calendar';

const STAFF_EMAIL = 'getxobelaeskola@gmail.com';

export class StripeHandlers {
    constructor(private supabase: SupabaseClient) { }

    async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        const metadata = session.metadata;
        if (!metadata || !metadata.user_id) throw new Error('Missing metadata.user_id');

        const { mode, user_id, locale = 'es' } = metadata;

        if (mode === 'subscription') {
            await this.processSubscription(session, user_id, locale);
        } else if (mode === 'rental_test' || mode === 'rental') {
            await this.processRental(session, user_id, locale);
        } else if (mode === 'course' || mode === 'edition') {
            await this.processCourse(session, user_id, locale);
        } else if (mode === 'bono_horas' || metadata.purchase_type === 'bono_horas') {
            await this.processBonoPurchase(session, user_id, locale);
        } else {
            console.warn(`Unknown checkout mode: ${mode}`);
        }
    }

    async handleSubscriptionUpdated(subscription: any) {
        const userId = subscription.metadata.user_id;
        if (!userId) return;

        const statusMap: Record<string, string> = {
            'active': 'active',
            'past_due': 'past_due',
            'unpaid': 'unpaid',
            'canceled': 'canceled',
            'incomplete': 'incomplete'
        };

        const dbStatus = statusMap[subscription.status] || 'active';

        const { data: subData } = await this.supabase
            .from('subscriptions')
            .update({
                status: dbStatus,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end
            })
            .eq('stripe_subscription_id', subscription.id)
            .select('user_id')
            .single();

        if (subData?.user_id) {
            await this.supabase
                .from('profiles')
                .update({
                    status_socio: subscription.status === 'active' ? 'activo' : (subscription.status === 'past_due' ? 'past_due' : 'no_socio'),
                    fecha_fin_periodo: new Date(subscription.current_period_end * 1000).toISOString()
                })
                .eq('id', subData.user_id);
        }
    }

    private async processSubscription(session: Stripe.Checkout.Session, userId: string, locale: string) {
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const { error: pErr } = await this.supabase.from('profiles').update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status_socio: 'activo',
            updated_at: new Date().toISOString()
        }).eq('id', userId);
        if (pErr) throw pErr;

        const { error: sErr } = await this.supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            status: 'active',
            created_at: new Date().toISOString()
        }, { onConflict: 'stripe_subscription_id' });
        if (sErr) throw sErr;

        await this.sendMembershipEmail(userId, locale, session.id);
    }

    private async processRental(session: Stripe.Checkout.Session, userId: string, locale: string) {
        const { service_id, option_index, reserved_date, reserved_time } = session.metadata!;

        const discounts = (session as any).total_details?.breakdown?.discounts;
        const usedCoupon = discounts?.[0]?.discount?.promotion_code?.code || discounts?.[0]?.discount?.coupon?.id;

        const { data: service } = await this.supabase.from('servicios_alquiler').select('*').eq('id', service_id).single();
        const optionLabel = (option_index && service?.opciones[parseInt(option_index)])
            ? service.opciones[parseInt(option_index)].label
            : 'Estándar';

        const { error } = await this.supabase.rpc('confirm_rental_booking', {
            p_user_id: userId,
            p_service_id: service_id,
            p_date: reserved_date || new Date().toISOString().split('T')[0],
            p_time: reserved_time || '10:00:00',
            p_option: optionLabel,
            p_amount: session.amount_total ? session.amount_total / 100 : 0,
            p_session_id: session.id,
            p_coupon: usedCoupon || null
        });

        if (error && (error.message.includes('not find') || error.code === 'PGRST202')) {
            console.warn('⚠️ RPC confirm_rental_booking not found, falling back to raw insert');
            const { error: insError } = await this.supabase.from('reservas_alquiler').insert({
                perfil_id: userId,
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
            if (insError) throw insError;
        } else if (error) {
            throw error;
        }

        await this.sendRentalNotifications(userId, service, reserved_date, reserved_time, optionLabel, session, locale);
    }

    private async processCourse(session: Stripe.Checkout.Session, userId: string, locale: string) {
        const { course_id, edition_id, start_date, end_date } = session.metadata!;

        const discounts = (session as any).total_details?.breakdown?.discounts;
        const usedCoupon = discounts?.[0]?.discount?.promotion_code?.code || discounts?.[0]?.discount?.coupon?.id;

        const { error } = await this.supabase.rpc('confirm_course_enrollment', {
            p_user_id: userId,
            p_course_id: course_id,
            p_edition_id: (edition_id && edition_id !== '' && !edition_id.startsWith('test-') && !edition_id.startsWith('ext_')) ? edition_id : null,
            p_amount: session.amount_total ? session.amount_total / 100 : 0,
            p_session_id: session.id,
            p_metadata: { start_date, end_date },
            p_coupon: usedCoupon || null
        });

        if (error && (error.message.includes('not find') || error.code === 'PGRST202')) {
            console.warn('⚠️ RPC confirm_course_enrollment not found, falling back to manual update');
            const { error: insError } = await this.supabase.from('inscripciones').insert({
                perfil_id: userId,
                curso_id: course_id,
                edicion_id: (edition_id && edition_id !== '' && !edition_id.startsWith('test-') && !edition_id.startsWith('ext_')) ? edition_id : null,
                estado_pago: 'pagado',
                monto_total: session.amount_total ? session.amount_total / 100 : 0,
                stripe_session_id: session.id,
                metadata: { start_date, end_date },
                cupon_usado: usedCoupon || null
            });
            if (insError) throw insError;

            const cleanEditionId = (edition_id && edition_id !== '' && !edition_id.startsWith('test-') && !edition_id.startsWith('ext_')) ? edition_id : null;
            if (cleanEditionId) {
                const { data: edData } = await this.supabase.from('ediciones_curso').select('plazas_ocupadas').eq('id', cleanEditionId).single();
                if (edData) {
                    await this.supabase.from('ediciones_curso').update({ plazas_ocupadas: (edData.plazas_ocupadas || 0) + 1 }).eq('id', cleanEditionId);
                }
            }
        } else if (error) {
            throw error;
        }

        await this.sendCourseNotifications(userId, course_id, session, locale);
    }

    private async sendMembershipEmail(userId: string, locale: string, sessionId: string) {
        try {
            if (!resend) return;
            const { data: profile } = await this.supabase.from('profiles').select('email, nombre').eq('id', userId).single();
            if (!profile?.email) return;

            const subjects: any = { es: '¡Ya eres Socio!', eu: 'Dagoeneko Bazkide zara!', en: 'You are now a Member!', fr: 'Vous êtes maintenant membre !' };
            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: profile.email,
                subject: `${subjects[locale] || subjects.es} - Getxo Sailing School`,
                html: membershipTemplate(profile.nombre || 'Navegante', locale as any)
            });

            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: STAFF_EMAIL,
                subject: `🛎️ NUEVA MEMBRESÍA: ${profile.nombre || 'Cliente'}`,
                html: internalOrderNotificationTemplate('membership', { userName: profile.nombre, itemName: 'Socio Mensual', amount: 20, sessionId })
            });
        } catch (e) {
            console.error('⚠️ Membership side-effects failed:', e);
        }
    }

    private async sendRentalNotifications(userId: string, service: any, date: string, time: string, option: string, session: any, locale: string) {
        try {
            if (!resend) return;
            const { data: profile } = await this.supabase.from('profiles').select('email, nombre').eq('id', userId).single();
            if (!profile?.email) return;

            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: profile.email,
                subject: `Reserva confirmada: ${service?.nombre_es}`,
                html: rentalTemplate(service?.nombre_es || 'Equipo', date || 'Hoy', time || '10:00', profile.nombre || 'Navegante', locale as any)
            });

            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: STAFF_EMAIL,
                subject: `🛶 NUEVO ALQUILER: ${service?.nombre_es || 'Equipo'} - ${profile.nombre || 'Cliente'}`,
                html: internalOrderNotificationTemplate('rental', {
                    userName: profile.nombre,
                    itemName: service?.nombre_es,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    date,
                    time,
                    sessionId: session.id
                })
            });

            await createRentalGoogleEvent({ fecha_reserva: date, hora_inicio: time, duracion_horas: 1, opcion_seleccionada: option, monto_total: session.amount_total / 100 }, service?.nombre_es, profile.nombre);
        } catch (e) {
            console.error('⚠️ Rental side-effects failed:', e);
        }
    }

    private async sendCourseNotifications(userId: string, courseId: string, session: any, locale: string) {
        try {
            if (!resend) return;
            const { data: profile } = await this.supabase.from('profiles').select('email, nombre').eq('id', userId).single();
            const { data: course } = await this.supabase.from('cursos').select('nombre_es').eq('id', courseId).single();
            if (!profile?.email) return;

            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: profile.email,
                subject: `Inscripción confirmada: ${course?.nombre_es}`,
                html: inscriptionTemplate(course?.nombre_es || 'Curso', profile.nombre || 'Alumno', locale as any)
            });

            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: STAFF_EMAIL,
                subject: `🎓 NUEVA INSCRIPCIÓN: ${course?.nombre_es || 'Curso'} - ${profile.nombre || 'Alumno'}`,
                html: internalOrderNotificationTemplate('course', {
                    userName: profile.nombre,
                    itemName: course?.nombre_es,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    sessionId: session.id
                })
            });
        } catch (e) {
            console.error('⚠️ Course side-effects failed:', e);
        }
    }

    private async processBonoPurchase(session: Stripe.Checkout.Session, userId: string, locale: string) {
        const { bono_id, horas } = session.metadata || {};
        if (!bono_id) throw new Error('Missing bono_id in metadata');

        const horasTotales = parseFloat(horas || '0');
        const fechaExpiracion = new Date();
        fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1); // 1 year validity by default

        // 1. Create User Bono
        const { data: userBono, error: bonoErr } = await this.supabase
            .from('bonos_usuario')
            .insert({
                usuario_id: userId,
                tipo_bono_id: bono_id,
                horas_iniciales: horasTotales,
                horas_restantes: horasTotales,
                fecha_expiracion: fechaExpiracion.toISOString(),
                estado: 'activo'
            })
            .select('id')
            .single();

        if (bonoErr) throw bonoErr;

        // 2. Initial Movement
        const { error: movErr } = await this.supabase
            .from('movimientos_bono')
            .insert({
                bono_id: userBono.id,
                tipo_movimiento: 'compra',
                horas: horasTotales,
                descripcion: `Compra de bono: ${session.id}`
            });

        if (movErr) throw movErr;

        // 3. Optional: Send notification
        console.log(`✅ Bono ${bono_id} granted to user ${userId}`);
    }

    async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
        console.log(`⚠️ Payment Failed: ${paymentIntent.id}`);

        let email = paymentIntent.receipt_email;
        let name = 'Cliente';

        if (!email && paymentIntent.customer) {
            try {
                const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer.id;
                const customer = await stripe.customers.retrieve(customerId);
                if (!customer.deleted && customer.email) {
                    email = customer.email;
                    name = customer.name || 'Cliente';
                }
            } catch (e) {
                console.warn('Could not fetch customer for failed payment', e);
            }
        }

        if (!email) {
            console.warn(`⚠️ No email found for payment intent ${paymentIntent.id}, cannot send failure notification.`);
            return;
        }

        const amount = (paymentIntent.amount / 100).toFixed(2);
        const currency = paymentIntent.currency.toUpperCase();
        const locale = (paymentIntent.metadata?.locale as any) || 'es';

        const subjects: any = {
            es: 'Error en el Pago - Acción Requerida',
            eu: 'Ordainketa Errorea - Ekintza Beharrezkoa',
            en: 'Payment Failed - Action Required',
            fr: 'Échec du paiement - Action requise'
        };

        try {
            if (resend) {
                await resend.emails.send({
                    from: DEFAULT_FROM_EMAIL,
                    to: email,
                    subject: `${subjects[locale] || subjects.es} - Getxo Sailing School`,
                    html: paymentFailedTemplate(name, amount, currency, locale)
                });
                console.log(`📧 Payment failed email sent to ${email}`);
            }
        } catch (e) {
            console.error('Failed to send payment failed email', e);
        }
    }
}
