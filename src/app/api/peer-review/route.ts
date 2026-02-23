import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

async function checkModuleCompletion(userId: string, moduleId: string) {
    const supabase = createClient();
    const { data: progress } = await supabase
        .from('progreso_alumno')
        .select('estado')
        .eq('alumno_id', userId)
        .eq('tipo_entidad', 'modulo')
        .eq('entidad_id', moduleId)
        .maybeSingle();

    return progress?.estado === 'completado';
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
        return NextResponse.json({ error: 'Falta moduleId' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const isCompleted = await checkModuleCompletion(user.id, moduleId);
    if (!isCompleted) {
        return NextResponse.json({ error: 'Debes completar el módulo para acceder a las revisiones.' }, { status: 403 });
    }

    const adminClient = createAdminClient() as any;

    const { data: units } = await supabase
        .from('unidades_didacticas')
        .select('id')
        .eq('modulo_id', moduleId);

    if (!units || units.length === 0) return NextResponse.json({ reviews: [] });
    const unitIds = units.map(u => u.id);

    const { data: activities } = await supabase
        .from('actividades')
        .select('id, titulo_es, titulo_eu, rubrica, unidad_id')
        .in('unidad_id', unitIds)
        .eq('tipo', 'ejercicio_escrito')
        .eq('requiere_revision', true);

    if (!activities || activities.length === 0) return NextResponse.json({ reviews: [] });
    const activityIds = activities.map(a => a.id);

    const { data: attempts } = await adminClient
        .from('intentos_actividad')
        .select('id, datos_json, created_at, actividad_id')
        .in('actividad_id', activityIds)
        .neq('alumno_id', user.id)
        .eq('estado_revision', 'pendiente')
        .limit(5);

    if (!attempts) return NextResponse.json({ reviews: [] });

    const reviews = (attempts as any[]).map((attempt: any) => {
        const activity = activities.find(a => a.id === attempt.actividad_id);
        return {
            id: attempt.id,
            submittedAt: attempt.created_at,
            content: attempt.datos_json,
            activityTitleEs: activity?.titulo_es,
            activityTitleEu: activity?.titulo_eu,
            rubric: activity?.rubrica
        };
    });

    return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
    const body = await request.json();
    const { intentoId, puntuacion, rubricaValores, feedback, moduleId } = body;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const isCompleted = await checkModuleCompletion(user.id, moduleId);
    if (!isCompleted) {
        return NextResponse.json({ error: 'No autorizado: Debes completar el módulo primero.' }, { status: 403 });
    }

    const adminClient = createAdminClient() as any;

    const { error: insertError } = await adminClient
        .from('peer_reviews')
        .insert({
            intento_id: intentoId,
            revisor_id: user.id,
            puntuacion: puntuacion,
            rubrica_valores: rubricaValores,
            feedback: feedback
        });

    if (insertError) {
        if (insertError.code === '23505') {
            return NextResponse.json({ error: 'Ya has revisado este ejercicio.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error al guardar la revisión' }, { status: 500 });
    }

    const { error: updateError } = await adminClient
        .from('intentos_actividad')
        .update({
            estado_revision: 'revisado',
            puntuacion: puntuacion,
            completado: true
        })
        .eq('id', intentoId);

    if (updateError) {
        return NextResponse.json({ error: 'Error al actualizar el estado del ejercicio' }, { status: 500 });
    }

    try {
        await adminClient.rpc('add_xp', {
            p_user_id: user.id,
            p_amount: 50
        });
    } catch (e) {
        console.error('Error awarding XP:', e);
    }

    revalidatePath(`/academy/module/${moduleId}`);
    return NextResponse.json({ success: true });
}
