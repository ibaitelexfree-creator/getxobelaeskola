
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { createGoogleEvent, updateGoogleEvent } from '@/lib/google-calendar';
import { validateSessionOverlap } from '@/lib/academy/session-validation';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        const body = await request.json();
        const {
            curso_id,
            instructor_id,
            embarcacion_id,
            fecha_inicio,
            fecha_fin,
            estado,
            observaciones,
            google_event_id
        } = body;

        if (!instructor_id || !fecha_inicio || !fecha_fin) {
            return NextResponse.json({ error: 'Faltan campos obligatorios (Instructor, Fecha Inicio/Fin)' }, { status: 400 });
        }

        if (isNaN(new Date(fecha_inicio).getTime()) || isNaN(new Date(fecha_fin).getTime())) {
            return NextResponse.json({ error: 'Formato de fecha inválido' }, { status: 400 });
        }

        const isNoCourse = !curso_id || curso_id === '' || curso_id === 'null' || curso_id === '00000000-0000-0000-0000-000000000000';
        const cleanEmbarcacionId = (embarcacion_id === '' || embarcacion_id === 'null' || !embarcacion_id) ? null : embarcacion_id;

        // Check for overlaps
        const { allowed, error: overlapError } = await validateSessionOverlap(supabaseAdmin as any, {
            instructor_id,
            embarcacion_id: cleanEmbarcacionId,
            fecha_inicio,
            fecha_fin
        });

        if (!allowed) {
            return NextResponse.json({ error: overlapError }, { status: 409 });
        }

        const { data, error } = await supabaseAdmin
            .from('sesiones')
            .insert({
                curso_id: isNoCourse ? null : curso_id,
                instructor_id,
                embarcacion_id: cleanEmbarcacionId,
                fecha_inicio,
                fecha_fin,
                estado: estado || 'programada',
                observaciones: observaciones || '',
                google_event_id: google_event_id || null
            })
            .select(`
                *,
                curso:cursos(nombre_es),
                instructor:profiles!sesiones_instructor_id_fkey(nombre, apellidos)
            `)
            .single();

        if (error) throw error;

        // Sync with Google Calendar
        try {
            const courseName = data.curso?.nombre_es || 'Clase';
            const instructorName = `${data.instructor?.nombre || ''} ${data.instructor?.apellidos || ''}`;

            if (google_event_id) {
                // If we already have a google ID (imported), we update it instead of creating
                await updateGoogleEvent(google_event_id, data, courseName, instructorName);
            } else {
                // Create new event
                const eventId = await createGoogleEvent(data, courseName, instructorName);
                if (eventId) {
                    await supabaseAdmin
                        .from('sesiones')
                        .update({ google_event_id: eventId })
                        .eq('id', data.id);
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
