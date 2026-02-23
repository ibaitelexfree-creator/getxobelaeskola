import { SupabaseClient } from '@supabase/supabase-js';

// Use 'any' for the generic to be compatible with whatever the project uses
export async function validateSessionOverlap(
    supabase: SupabaseClient<any, "public", any> | any,
    {
        instructor_id,
        embarcacion_id,
        fecha_inicio,
        fecha_fin,
        exclude_session_id
    }: {
        instructor_id?: string | null;
        embarcacion_id?: string | null;
        fecha_inicio: string;
        fecha_fin: string;
        exclude_session_id?: string;
    }
): Promise<{ allowed: boolean; error?: string }> {

    // If neither resource is requested, no conflict possible (for this specific check)
    if (!instructor_id && !embarcacion_id) {
        return { allowed: true };
    }

    let query = supabase
        .from('sesiones')
        .select('id, instructor_id, embarcacion_id')
        .neq('estado', 'cancelada')
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        // Checks if existing session starts before the new one ends AND ends after the new one starts
        .lt('fecha_inicio', fecha_fin)
        .gt('fecha_fin', fecha_inicio);

    if (exclude_session_id) {
        query = query.neq('id', exclude_session_id);
    }

    const conditions: string[] = [];
    if (instructor_id) conditions.push(`instructor_id.eq.${instructor_id}`);
    if (embarcacion_id) conditions.push(`embarcacion_id.eq.${embarcacion_id}`);

    if (conditions.length > 0) {
        query = query.or(conditions.join(','));
    } else {
        return { allowed: true };
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        console.error('Error checking overlap:', error);
        throw new Error('Error verifying availability');
    }

    if (data) {
        let msg = 'Conflicto de horario detectado.';
        if (instructor_id && data.instructor_id === instructor_id) {
            msg = 'El instructor ya tiene una sesión en ese horario.';
        }
        if (embarcacion_id && data.embarcacion_id === embarcacion_id) {
            // Check if msg was already set by instructor conflict
            if (msg === 'Conflicto de horario detectado.') {
                msg = 'La embarcación ya está reservada en ese horario.';
            } else {
                msg += ' También la embarcación está ocupada.';
            }
        }
        return { allowed: false, error: msg };
    }

    return { allowed: true };
}
