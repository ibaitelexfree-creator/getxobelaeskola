// This file no longer uses 'use server' to allow static export for Capacitor.
// It now calls an API route instead.
import { createClient } from '@/lib/supabase/client';

export async function getPendingReviews(moduleId: string) {
    try {
        const res = await fetch(`/api/peer-review?moduleId=${moduleId}`);
        return await res.json();
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        return { error: 'Error de conexión' };
    }
}

export async function submitReview(reviewData: {
    intentoId: string;
    puntuacion: number;
    rubricaValores: any;
    feedback: string;
    moduleId: string;
}) {
    try {
        const res = await fetch('/api/peer-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });
        return await res.json();
    } catch (error) {
        console.error('Error submitting review:', error);
        return { error: 'Error de conexión' };
    }
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

    const { data: existing } = await supabase
        .from('intentos_actividad')
        .select('id, estado_revision')
        .eq('alumno_id', user.id)
        .eq('actividad_id', data.activityId)
        .maybeSingle();

    if (existing) {
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

    return { success: true };
}
