import { requireAuth } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
    try {
        const { serviceId, optionIndex, locale, reservedDate, reservedTime, legalName, legalDni } = await request.json();
        const { user, supabase, error: authError } = await requireAuth();
        if (authError) return authError;

        const { data: profile } = await supabase.from('profiles').select('nombre, apellidos').eq('id', user.id).single();

        // 2. Get Service Details
        const { data: service, error } = await supabase
            .from('servicios_alquiler')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (error || !service) {
            return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
        }

        // --- NEW: AVAILABILITY CHECK ---
        const { count: currentBookings, error: countError } = await supabase
            .from('reservas_alquiler')
            .select('*', { count: 'exact', head: true })
            .eq('servicio_id', serviceId)
            .eq('fecha_reserva', reservedDate)
            .eq('hora_inicio', reservedTime)
            .neq('estado_pago', 'cancelado');

        if (countError) {
            console.error('Count error:', countError);
            return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 });
        }

        const stockLimit = service.stock_total || 1;
        if (currentBookings !== null && currentBookings >= stockLimit) {
            return NextResponse.json({
                error: `Lo sentimos, no hay ${service.nombre_es} disponibles para el ${reservedDate} a las ${reservedTime}. Por favor, elige otra hora.`
            }, { status: 400 });
        }
        // --- END AVAILABILITY CHECK ---

        // --- NEW: DOUBLE-BOOKING CHECK (Gating) ---
        const { data: userBooking } = await supabase
            .from('reservas_alquiler')
            .select('id')
            .eq('perfil_id', user.id)
            .eq('servicio_id', serviceId)
            .eq('fecha_reserva', reservedDate)
            .eq('hora_inicio', reservedTime)
            .neq('estado_pago', 'cancelado')
            .maybeSingle();

        if (userBooking) {
            return NextResponse.json({
                error: 'Ya tienes una reserva para este horario. Por favor, revisa tu panel de control.'
            }, { status: 400 });
        }
        // ------------------------------------------

        // 3. Calculate Price
        let finalPrice = service.precio_base;
        let optionLabel = '';

        if (optionIndex !== undefined && service.opciones[optionIndex]) {
            finalPrice += service.opciones[optionIndex].extra;
            optionLabel = service.opciones[optionIndex].label;
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://getxobelaeskola.cloud' : 'http://localhost:3000');

        // 4. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Alquiler: ${service.nombre_es} ${optionLabel ? `(${optionLabel})` : ''}`,
                            description: `Reserva de material de náutica en Getxo`,
                        },
                        unit_amount: Math.round(finalPrice * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${appUrl}/${locale}/student/dashboard?success=true`,
            cancel_url: `${appUrl}/${locale}/rental?canceled=true`,
            metadata: {
                user_id: user.id as string,
                user_name: profile?.nombre ? `${profile.nombre} ${profile.apellidos || ''}` : (user.email as string),
                service_id: serviceId as string,
                stripe_product_id: service.stripe_product_id as string || '',
                item_name: `Alquiler: ${service.nombre_es} ${optionLabel ? `(${optionLabel})` : ''}`,
                option_index: optionIndex !== undefined ? optionIndex.toString() : '',
                reserved_date: reservedDate as string,
                reserved_time: reservedTime as string,
                legal_name: (legalName as string) || '',
                legal_dni: (legalDni as string) || '',
                locale: (locale as string) || 'es',
                mode: 'rental_test'
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('STRICT STRIPE ERROR:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
