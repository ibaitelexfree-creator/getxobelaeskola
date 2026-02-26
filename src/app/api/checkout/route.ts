<<<<<<< HEAD
import { requireAuth } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { Course, CourseEdition, Inscription } from '@/types/courses';

export async function POST(request: Request) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 503 });
    }
    try {
        const { editionId, courseId, locale = 'es', startDate, endDate, legalName, legalDni } = await request.json();

        if (!courseId) {
            return NextResponse.json({ error: 'Falta el ID del curso' }, { status: 400 });
        }

        const { user, supabase, error: authError } = await requireAuth();
        if (authError || !user) return authError || NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('nombre, apellidos').eq('id', user.id).single();

        const host = request.headers.get('host') || 'getxobelaeskola.cloud';
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const origin = request.headers.get('origin') || `${protocol}://${host}`;

        let course: Course | null = null;
        let edition: CourseEdition | null = null;

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
            edition = ed as unknown as CourseEdition;
            course = edition.cursos || null;
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
            course = c as unknown as Course;
            // edition remains null
        } else {
            return NextResponse.json({ error: 'Faltan datos (editionId o courseId)' }, { status: 400 });
        }

        if (!course) {
            return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
        }

        // --- ENROLLMENT CHECK (Gating) ---
        const { data: alreadyEnrolled } = await supabase
            .from('inscripciones')
            .select('id')
            .eq('perfil_id', user.id)
            .eq('curso_id', course.id)
            .eq('edicion_id', editionId || null)
            .eq('estado_pago', 'pagado')
            .maybeSingle();

        if (alreadyEnrolled) {
            return NextResponse.json({ error: 'Ya estás inscrito en este curso o edición' }, { status: 400 });
        }

        const itemName = locale === 'es' ? course.nombre_es : course.nombre_eu;
        let imageUrl = course.imagen_url;
        if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${origin}${imageUrl}`;

        // --- ZERO PRICE BYPASS (Updated for Online Courses) ---
        if (course.precio === 0) {

            const inscriptionData: Partial<Inscription> = {
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

            if (editionId && editionId !== '' && !editionId.startsWith('test-') && !editionId.startsWith('ext_')) {
                inscriptionData.edicion_id = editionId;
            } else {
                // Try to find ANY edition to link (for internal tracking if possible)
                const { data: latestEd } = await supabase.from('ediciones_curso')
                    .select('id')
                    .eq('curso_id', course.id)
                    .gt('fecha_fin', new Date().toISOString())
                    .limit(1)
                    .single();

                if (latestEd) {
                    inscriptionData.edicion_id = latestEd.id;
                } else {
                    inscriptionData.edicion_id = null;
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
            tax_id_collection: { enabled: true },
            allow_promotion_codes: true,
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
            success_url: `${origin}/${locale}/student/payment-success?session_id={CHECKOUT_SESSION_ID}&type=course`,
            cancel_url: `${origin}/${locale}/courses/${course.slug}?canceled=true`,
            customer_email: user.email,
            metadata: {
                edition_id: (editionId as string) || '', // Stripe metadata doesn't like null
                user_id: user.id as string,
                course_id: course.id as string,
                stripe_product_id: course.stripe_product_id as string || '',
                item_name: itemName as string,
                user_name: profile?.nombre ? `${profile.nombre} ${profile.apellidos || ''}` : (user.email as string),
                start_date: (startDate as string) || '',
                end_date: (endDate as string) || '',
                legal_name: (legalName as string) || '',
                legal_dni: (legalDni as string) || '',
                locale: (locale as string) || 'es',
                mode: 'course'
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('Stripe Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
=======
import { requireAuth } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        const { editionId, courseId, locale = 'es', startDate, endDate, legalName, legalDni } = await request.json();

        if (!courseId) {
            return NextResponse.json({ error: 'Falta el ID del curso' }, { status: 400 });
        }

        const { user, supabase, error: authError } = await requireAuth();
        if (authError || !user) return authError || NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('nombre, apellidos').eq('id', user.id).single();

        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
        const origin = request.headers.get('origin') || `${protocol}://${host}`;

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

        // --- ENROLLMENT CHECK (Gating) ---
        const { data: alreadyEnrolled } = await supabase
            .from('inscripciones')
            .select('id')
            .eq('perfil_id', user.id)
            .eq('curso_id', course.id)
            .eq('edicion_id', editionId || null)
            .eq('estado_pago', 'pagado')
            .maybeSingle();

        if (alreadyEnrolled) {
            return NextResponse.json({ error: 'Ya estás inscrito en este curso o edición' }, { status: 400 });
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

            if (editionId && editionId !== '' && !editionId.startsWith('test-') && !editionId.startsWith('ext_')) {
                inscriptionData.edicion_id = editionId;
            } else {
                // Try to find ANY edition to link (for internal tracking if possible)
                const { data: latestEd } = await supabase.from('ediciones_curso')
                    .select('id')
                    .eq('curso_id', course.id)
                    .gt('fecha_fin', new Date().toISOString())
                    .limit(1)
                    .single();

                if (latestEd) {
                    inscriptionData.edicion_id = latestEd.id;
                } else {
                    inscriptionData.edicion_id = null;
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
            tax_id_collection: { enabled: true },
            allow_promotion_codes: true,
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
            success_url: `${origin}/${locale}/student/payment-success?session_id={CHECKOUT_SESSION_ID}&type=course`,
            cancel_url: `${origin}/${locale}/courses/${course.slug}?canceled=true`,
            customer_email: user.email,
            metadata: {
                edition_id: (editionId as string) || '', // Stripe metadata doesn't like null
                user_id: user.id as string,
                course_id: course.id as string,
                stripe_product_id: course.stripe_product_id as string || '',
                item_name: itemName as string,
                user_name: profile?.nombre ? `${profile.nombre} ${profile.apellidos || ''}` : (user.email as string),
                start_date: (startDate as string) || '',
                end_date: (endDate as string) || '',
                legal_name: (legalName as string) || '',
                legal_dni: (legalDni as string) || '',
                locale: (locale as string) || 'es',
                mode: 'course'
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('Stripe Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
>>>>>>> pr-286
