import { SupabaseClient } from '@supabase/supabase-js';

export async function validateSessionOverlap(
    supabase: SupabaseClient,
    {
        instructor_id,
        embarcacion_id,
        fecha_inicio,
        fecha_fin,
        exclude_session_id
    }: {
        instructor_id: string;
        embarcacion_id?: string | null;
        fecha_inicio: string;
        fecha_fin: string;
        exclude_session_id?: string;
    }
): Promise<{ error: string | null }> {
    // Basic validation
    if (!instructor_id) return { error: 'Instructor es requerido' };
    if (!fecha_inicio || !fecha_fin) return { error: 'Fechas son requeridas' };

    // Ensure valid dates
    const start = new Date(fecha_inicio).toISOString();
    const end = new Date(fecha_fin).toISOString();

    if (start >= end) return { error: 'La fecha de inicio debe ser anterior a la de fin' };

    // Build query
    let query = supabase
        .from('sesiones')
        .select('id, instructor_id, embarcacion_id, fecha_inicio, fecha_fin, estado')
        .neq('estado', 'cancelada')
        // Time overlap: (StartA < EndB) and (EndA > StartB)
        .lt('fecha_inicio', end)
        .gt('fecha_fin', start);

    if (exclude_session_id) {
        query = query.neq('id', exclude_session_id);
    }

    // Filter by Instructor OR Boat
    // Use proper OR syntax for Supabase: "col1.eq.val1,col2.eq.val2"
    const orConditions = [`instructor_id.eq.${instructor_id}`];

    // Only check boat if it's assigned (not null/empty)
    if (embarcacion_id && embarcacion_id !== 'null') {
        orConditions.push(`embarcacion_id.eq.${embarcacion_id}`);
    }

    query = query.or(orConditions.join(','));

    const { data, error } = await query;

    if (error) {
        console.error('Error validating session overlap:', error);
        return { error: 'Error al verificar disponibilidad' };
    }

    if (data && data.length > 0) {
        // Find specifically what caused the conflict
        const conflict = data[0];
        if (conflict.instructor_id === instructor_id) {
            return { error: 'El instructor ya tiene una sesión en ese horario' };
        }
        if (conflict.embarcacion_id === embarcacion_id) {
            return { error: 'La embarcación ya está ocupada en ese horario' };
        }
        return { error: 'Conflicto de horario detectado' };
    }

    return { error: null };
}
