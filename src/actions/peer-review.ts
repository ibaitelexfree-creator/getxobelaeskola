'use server'

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// Helper to check completion (reused)
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

export async function getPendingReviews(moduleId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'No autenticado' };
    }

    const isCompleted = await checkModuleCompletion(user.id, moduleId);
    if (!isCompleted) {
        return { error: 'Debes completar el módulo para acceder a las revisiones.' };
    }

    const adminClient = createAdminClient();

    // 2. Find eligible submissions (intentos_actividad)
    // Step 2a: Get units for this module (standard client is fine, public data usually)
    const { data: units } = await supabase
        .from('unidades_didacticas')
        .select('id')
        .eq('modulo_id', moduleId);

    if (!units || units.length === 0) return { reviews: [] };
    const unitIds = units.map(u => u.id);

    // Step 2b: Get activities of type 'ejercicio_escrito'
    const { data: activities } = await supabase
        .from('actividades')
        .select('id, titulo_es, titulo_eu, rubrica, unidad_id')
        .in('unidad_id', unitIds)
        .eq('tipo', 'ejercicio_escrito')
        .eq('requiere_revision', true);

    if (!activities || activities.length === 0) return { reviews: [] };
    const activityIds = activities.map(a => a.id);

    // Step 2c: Get pending attempts (USING ADMIN CLIENT)
    const { data: attempts } = await adminClient
        .from('intentos_actividad')
        .select('id, datos_json, created_at, actividad_id')
        .in('actividad_id', activityIds)
        .neq('alumno_id', user.id) // Exclude own submissions
        .eq('estado_revision', 'pendiente')
        .limit(5);

    if (!attempts) return { reviews: [] };

    // Step 3: Enrich
    const reviews = attempts.map(attempt => {
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

    return { reviews };
}

export async function submitReview(reviewData: {
    intentoId: string;
    puntuacion: number;
    rubricaValores: any;
    feedback: string;
    moduleId: string;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'No autenticado' };
    }

    // 1. Validate module completion
    const isCompleted = await checkModuleCompletion(user.id, reviewData.moduleId);
    if (!isCompleted) {
        return { error: 'No autorizado: Debes completar el módulo primero.' };
    }

    const adminClient = createAdminClient();

    // 2. Create the review record (USING ADMIN CLIENT)
    // Note: Since we use admin client, RLS is bypassed. We MUST ensure revisor_id is correct.
    const { error: insertError } = await adminClient
        .from('peer_reviews')
        .insert({
            intento_id: reviewData.intentoId,
            revisor_id: user.id, // Explicitly set from auth context
            puntuacion: reviewData.puntuacion,
            rubrica_valores: reviewData.rubricaValores,
            feedback: reviewData.feedback
        });

    if (insertError) {
        // Handle unique constraint violation (already reviewed)
        if (insertError.code === '23505') {
            return { error: 'Ya has revisado este ejercicio.' };
        }
        console.error('Error inserting review:', insertError);
        return { error: 'Error al guardar la revisión' };
    }

    // 3. Update the submission status (USING ADMIN CLIENT)
    const { error: updateError } = await adminClient
        .from('intentos_actividad')
        .update({
            estado_revision: 'revisado',
            puntuacion: reviewData.puntuacion,
            completado: true
        })
        .eq('id', reviewData.intentoId);

    if (updateError) {
        console.error('Error updating submission:', updateError);
        return { error: 'Error al actualizar el estado del ejercicio' };
    }

    // 4. Award XP (USING ADMIN CLIENT to bypass policies if any, though function is SECURITY DEFINER)
    // Using admin client is safer here just in case.
    try {
        await adminClient.rpc('add_xp', {
            p_user_id: user.id,
            p_amount: 50
        });
    } catch (e) {
        console.error('Error awarding XP:', e);
    }

    revalidatePath(`/academy/module/${reviewData.moduleId}`);
    return { success: true };
}

export async function submitExerciseAttempt(data: {
    activityId: string;
    content: string;
    unitId: string;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'No autenticado' };
    }

    // Check if activity exists and accepts submissions
    // Ideally we also check enrollment/access, but RLS on inserts handles 'auth.uid() = alumno_id'

    // Using upsert or simple insert. Let's assume one attempt per activity for now,
    // or we allow multiple but filter for the latest.
    // Given the unique constraint might not be on (alumno_id, actividad_id), let's just insert.
    // However, if the user already submitted, we might want to prevent another one while pending.

    const { data: existing } = await supabase
        .from('intentos_actividad')
        .select('id, estado_revision')
        .eq('alumno_id', user.id)
        .eq('actividad_id', data.activityId)
        .maybeSingle();

    if (existing) {
        // Update existing attempt if it's not approved yet? Or just return error?
        // Let's allow updating if it's still pending or rejected.
        if (existing.estado_revision === 'aprobado') {
             return { error: 'Este ejercicio ya ha sido aprobado.' };
        }

        const { error } = await supabase
            .from('intentos_actividad')
            .update({
                datos_json: { text: data.content },
                estado_revision: 'pendiente', // Reset to pending if it was something else
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

        if (error) return { error: 'Error al actualizar la entrega.' };
    } else {
        const { error } = await supabase
            .from('intentos_actividad')
            .insert({
                alumno_id: user.id,
                actividad_id: data.activityId,
                datos_json: { text: data.content },
                estado_revision: 'pendiente',
                puntuacion_maxima: 100, // Default
                puntuacion: null,
                completado: false
            });

        if (error) {
            console.error(error);
            return { error: 'Error al enviar la entrega.' };
        }
    }

    revalidatePath(`/academy/unit/${data.unitId}`);
    return { success: true };
}
