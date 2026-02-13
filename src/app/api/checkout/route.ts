import { requireAuth } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
    try {
        const { editionId, courseId, locale, startDate, endDate } = await request.json();
        const { user, supabase, error: authError } = await requireAuth();
        if (authError) return authError;

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        let course: any = null;
        let edition: any = null;

        // 1. Fetch Course Data
        if (editionId && !editionId.startsWith('ext_')) {
            const { data: ed, error: edError } = await supabase
                .from('ediciones_curso')
                .select('*, cursos(*)')
                .eq('id', editionId)
                .single();

            if (edError || !ed) {
                return NextResponse.json({ error: 'Edición no encontrada' }, { status: 404 });
            }
            edition = ed;
            course = ed.cursos;
        } else if (courseId) {
            // Handle external calendar event or direct course booking
            const { data: c, error: cError } = await supabase
                .from('cursos')
                .select('*')
                .eq('id', courseId)
                .single();

            if (cError || !c) {
                return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
            }
            course = c;
            // edition remains null
        } else {
            return NextResponse.json({ error: 'Faltan datos (editionId o courseId)' }, { status: 400 });
        }

        const itemName = locale === 'es' ? course.nombre_es : course.nombre_eu;
        let imageUrl = course.imagen_url;
        if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${origin}${imageUrl}`;

        // --- ZERO PRICE BYPASS (Updated for Online Courses) ---
        if (course.precio === 0) {

            const inscriptionData: any = {
                perfil_id: user.id,
                curso_id: course.id,
                estado_pago: 'pagado',
                monto_total: 0,
                stripe_session_id: `FREE_${Date.now()}`,
                metadata: {
                    start_date: startDate || new Date().toISOString(),
                    end_date: endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
                }
            };

            if (editionId) {
                inscriptionData.edicion_id = editionId;
            } else {
                // Try to find ANY edition to link
                const { data: latestEd } = await supabase.from('ediciones_curso')
                    .select('id')
                    .eq('curso_id', course.id)
                    .gt('fecha_fin', new Date().toISOString())
                    .limit(1)
                    .single();

                if (latestEd) {
                    inscriptionData.edicion_id = latestEd.id;
                }
            }

            const { error: insError } = await supabase
                .from('inscripciones')
                .insert(inscriptionData);

            if (insError) {
                console.error('Free Course Enrollment Error:', insError);
                return NextResponse.json({ error: 'Error al inscribirse: ' + insError.message }, { status: 500 });
            }

            // Update occupancy if edition exists
            const targetEditionId = editionId || inscriptionData.edicion_id;
            if (targetEditionId) {
                // Try simple update first as it is safer than assuming RPC exists
                const { error: updateError } = await supabase.rpc('increment_occupancy', { edition_id: targetEditionId });
                if (updateError) {
                    // manual fallback
                    if (edition) {
                        await supabase
                            .from('ediciones_curso')
                            .update({ plazas_ocupadas: (edition.plazas_ocupadas || 0) + 1 })
                            .eq('id', edition.id);
                    }
                }
            }

            return NextResponse.json({ url: `${origin}/${locale}/student/dashboard?success=true` });
        }
        // -------------------------

        // --- STRIPE CHECKOUT (Price > 0) ---

        // Validation: Edition is mandatory for paid courses usually, but if not we need description
        // For now assume all paid courses use editions or we fall back to generic desc

        const description = edition
            ? `Edición del ${new Date(edition.fecha_inicio).toLocaleDateString()}`
            : 'Curso Online / Acceso Completo';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: itemName,
                            description: description,
                            images: imageUrl ? [imageUrl] : [],
                        },
                        unit_amount: Math.round(course.precio * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/${locale}/student/dashboard?success=true`,
            cancel_url: `${origin}/${locale}/courses/${course.slug}?canceled=true`,
            customer_email: user.email,
            metadata: {
                edition_id: editionId || '', // Stripe metadata doesn't like null
                user_id: user.id,
                course_id: course.id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('Stripe Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
