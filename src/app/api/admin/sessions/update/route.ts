
<<<<<<< HEAD

import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { createGoogleEvent, updateGoogleEvent } from '@/lib/google-calendar';
import { validateSessionOverlap } from '@/lib/session-validation';

export async function POST(request: Request) {
    try {
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { user, profile, supabaseAdmin } = auth;
=======
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { createGoogleEvent, updateGoogleEvent } from '@/lib/google-calendar';

export async function POST(request: Request) {
    try {
        const { user, profile, supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;
>>>>>>> pr-286

        const body = await request.json();
        const {
            id,
            curso_id,
            instructor_id,
            embarcacion_id,
            fecha_inicio,
            fecha_fin,
            estado,
            observaciones
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
        }

<<<<<<< HEAD
        const isAdmin = profile?.rol === 'admin';
        const isInstructor = profile?.rol === 'instructor';
=======
        const isAdmin = profile.rol === 'admin';
        const isInstructor = profile.rol === 'instructor';
>>>>>>> pr-286

        // Fetch current session for permissions and history comparison
        const { data: currentSession, error: fetchError } = await supabaseAdmin
            .from('sesiones')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !currentSession) {
            return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
        }

        // Instructors can only update their own sessions (to change status/obs)
        if (isInstructor && !isAdmin && currentSession.instructor_id !== user.id) {
            return NextResponse.json({ error: 'No puedes modificar sesiones que no tienes asignadas' }, { status: 403 });
        }

<<<<<<< HEAD
        const updateData: Record<string, unknown> = {};
=======
        const updateData: Record<string, any> = {};
>>>>>>> pr-286

        // Anyone with access to this route (Instructors/Admins) can update these fields
        if (curso_id !== undefined) {
            const isNoCourse = !curso_id || curso_id === '' || curso_id === 'null' || curso_id === '00000000-0000-0000-0000-000000000000';
            updateData.curso_id = isNoCourse ? null : curso_id;
        }

        if (instructor_id !== undefined) updateData.instructor_id = instructor_id;

        // Handle empty string as null for boat association
        if (embarcacion_id !== undefined) {
            updateData.embarcacion_id = (embarcacion_id === '' || embarcacion_id === 'null' || !embarcacion_id) ? null : embarcacion_id;
        }

        if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio;
        if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin;
        if (estado !== undefined) updateData.estado = estado;
        if (observaciones !== undefined) updateData.observaciones = observaciones;

<<<<<<< HEAD
        // Validate overlapping sessions (unless cancelling)
        const nextState = updateData.estado !== undefined ? updateData.estado : currentSession.estado;

        if (nextState !== 'cancelada') {
            const nextInstructorId = updateData.instructor_id !== undefined ? updateData.instructor_id : currentSession.instructor_id;
            const nextStart = updateData.fecha_inicio !== undefined ? updateData.fecha_inicio : currentSession.fecha_inicio;
            const nextEnd = updateData.fecha_fin !== undefined ? updateData.fecha_fin : currentSession.fecha_fin;

            let nextBoatId;
            if (updateData.embarcacion_id !== undefined) {
                nextBoatId = updateData.embarcacion_id;
            } else {
                nextBoatId = currentSession.embarcacion_id;
            }

            const validation = await validateSessionOverlap(supabaseAdmin, {
                instructor_id: nextInstructorId,
                embarcacion_id: nextBoatId,
                fecha_inicio: nextStart,
                fecha_fin: nextEnd,
                exclude_session_id: id
            });

            if (validation.error) {
                return NextResponse.json({ error: validation.error }, { status: 409 });
            }
        }

=======
>>>>>>> pr-286
        // Perform update
        const { data, error } = await supabaseAdmin
            .from('sesiones')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // --- HISTORY LOGGING ---
<<<<<<< HEAD
        interface HistoryEntry {
            session_id: string;
            staff_id: string;
            field_name: string;
            old_value: string;
            new_value: string;
        }
        const historyEntries: HistoryEntry[] = [];
        for (const [key, newValue] of Object.entries(updateData)) {
            const oldValue = (currentSession as Record<string, unknown>)[key];
            if (String(newValue) !== String(oldValue)) {
                historyEntries.push({
                    session_id: id,
                    staff_id: user.id,
                    field_name: key,
                    old_value: String(oldValue || ''),
=======
        // Compare values and log changes
        const historyEntries = [];
        for (const [key, newValue] of Object.entries(updateData)) {
            const oldValue = currentSession[key];
            // Simple comparison, might need refinement for dates/objects
            if (String(newValue) !== String(oldValue)) {
                // If value changed, log it
                historyEntries.push({
                    session_id: id,
                    staff_id: user.id, // Log who made the change
                    field_name: key,
                    old_value: String(oldValue || ''), // Handle nulls
>>>>>>> pr-286
                    new_value: String(newValue || '')
                });
            }
        }

        if (historyEntries.length > 0) {
            const { error: historyError } = await supabaseAdmin
                .from('session_edits')
                .insert(historyEntries);

            if (historyError) {
                console.error('Error logging session history:', historyError);
<<<<<<< HEAD
=======
                // Don't fail the request, just log error
>>>>>>> pr-286
            }
        }

        // --- GOOGLE CALENDAR SYNC ---
        try {
            // Re-fetch with joins to get names
            const { data: sessionData, error: sessionError } = await supabaseAdmin
                .from('sesiones')
                .select(`
                    *,
                    curso:cursos(nombre_es),
                    instructor:profiles!sesiones_instructor_id_fkey(nombre, apellidos)
                `)
                .eq('id', id)
                .single();

            if (!sessionError && sessionData) {
                const courseName = sessionData.curso?.nombre_es || 'Clase';
                const instructorName = `${sessionData.instructor?.nombre || ''} ${sessionData.instructor?.apellidos || ''}`;

                if (sessionData.google_event_id) {
                    await updateGoogleEvent(sessionData.google_event_id, sessionData, courseName, instructorName);
                } else {
                    // Create if not exists (in case it wasn't synced before)
                    const eventId = await createGoogleEvent(sessionData, courseName, instructorName);
                    if (eventId) {
                        await supabaseAdmin.from('sesiones').update({ google_event_id: eventId }).eq('id', id);
                    }
                }
            }
        } catch (calError) {
            console.error('Calendar Sync Error:', calError);
        }

        return NextResponse.json({ success: true, session: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
<<<<<<< HEAD

=======
>>>>>>> pr-286
