import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { calculateNextSRS, SRSState } from '@/lib/srs';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const supabaseAdmin = createAdminClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { intento_id, respuestas, tiempo_empleado_seg } = body;

        if (!intento_id || !respuestas) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        // Verificar que el intento pertenece al alumno
        const { data: intento, error: intentoError } = await supabase
            .from('intentos_evaluacion')
            .select('*, evaluacion:evaluacion_id(*)')
            .eq('id', intento_id)
            .eq('alumno_id', user.id)
            .single();

        if (intentoError || !intento) {
            return NextResponse.json({ error: 'Intento no encontrado' }, { status: 404 });
        }

        if (intento.estado !== 'en_progreso') {
            return NextResponse.json({ error: 'Este intento ya fue completado' }, { status: 400 });
        }

        // Actualizar el intento con las respuestas
        // FIX 2: Merge respuestas nuevas con las existentes (autosave)
        const respuestasMerged = { ...(intento.respuestas_json || {}), ...respuestas };

        const { error: updateError } = await supabase
            .from('intentos_evaluacion')
            .update({
                respuestas_json: respuestasMerged,
                tiempo_empleado_seg: tiempo_empleado_seg,
                estado: 'completado',
                fecha_completado: new Date().toISOString()
            })
            .eq('id', intento_id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Calcular puntuación
        const { data: resultado, error: calcError } = await supabase
            .rpc('calcular_puntuacion_intento', { p_intento_id: intento_id });

        if (calcError) {
            return NextResponse.json({ error: calcError.message }, { status: 500 });
        }

        const puntuacion = resultado[0];

        // Actualizar el intento con la puntuación
        const { error: scoreError } = await supabase
            .from('intentos_evaluacion')
            .update({
                puntos_obtenidos: puntuacion.puntos_obtenidos,
                puntos_totales: puntuacion.puntos_totales,
                puntuacion: puntuacion.puntuacion,
                aprobado: puntuacion.aprobado
            })
            .eq('id', intento_id);

        if (scoreError) {
            return NextResponse.json({ error: scoreError.message }, { status: 500 });
        }

        // 6. PROPAGAR PROGRESO (Cascada Unidad -> Módulo -> Curso -> Nivel)
        // Fase 17: Eliminamos fallback manual para garantizar integridad vía SQL RPC
        const { error: rpcError } = await supabase.rpc('recalcular_progreso_alumno', {
            p_alumno_id: user.id,
            p_tipo_entidad: 'unidad',
            p_entidad_id: intento.evaluacion.entidad_id
        });

        if (rpcError) {
            console.error('Error en recalcular_progreso_alumno:', rpcError);
            // No bloqueamos el submit, pero el progreso podría quedar inconsistente si falla
        }

        // 7. ACTUALIZAR RACHA (Fase 8 - Silencioso si falla)
        try {
            if (puntuacion.aprobado) {
                await supabase.rpc('incrementar_racha_quizzes', { p_alumno_id: user.id });
            } else {
                await supabase.rpc('resetear_racha_quizzes', { p_alumno_id: user.id });
            }
        } catch {
            // No bloqueamos por la racha
        }

        // 8. BUSCAR LOGROS Y HABILIDADES RECIENTES (Fase 13 - Integración)
        const secondsBuffer = 10;
        const bufferTime = new Date(Date.now() - secondsBuffer * 1000).toISOString();

        const { data: nLogros } = await supabase
            .from('logros_alumno')
            .select('*, logro:logro_id(*)')
            .eq('alumno_id', user.id)
            .gte('fecha_obtenido', bufferTime);

        const { data: nHabilidades } = await supabase
            .from('student_skills')
            .select('*, skill:skill_id(*)')
            .eq('student_id', user.id)
            .gte('unlocked_at', bufferTime);

        // Obtener las respuestas correctas (para SRS y para mostrar si está configurado)
        let respuestasCorrectas = null;
        const { data: preguntas } = await supabaseAdmin
            .from('preguntas')
            .select('id, respuesta_correcta, explicacion_es, explicacion_eu')
            .in('id', intento.preguntas_json);

        if (intento.evaluacion.mostrar_respuestas) {
            respuestasCorrectas = preguntas;
        }

        // --- ACTUALIZAR SRS (Anki algorithm) ---
        if (preguntas) {
            // Fetch existing SRS states
            const { data: existingProgress } = await supabase
                .from('progreso_preguntas')
                .select('*')
                .eq('alumno_id', user.id)
                .in('pregunta_id', intento.preguntas_json);

            const progressMap = new Map(existingProgress?.map(p => [p.pregunta_id, p]));
            const questionMap = new Map(preguntas.map(q => [q.id, q]));

            const srsUpdates = [];

            const preguntasArray = Array.isArray(intento.preguntas_json) ? intento.preguntas_json : [];

            for (const preguntaId of preguntasArray) {
                const question = questionMap.get(preguntaId);
                if (!question) continue;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const userAnswer = (respuestasMerged as any)[preguntaId];

                // Compare answer. This assumes respuesta_correcta matches userAnswer format.
                const isCorrect = userAnswer === question.respuesta_correcta;
                const quality = isCorrect ? 5 : 1; // 5 = perfect, 1 = wrong

                const currentSRSDB = progressMap.get(preguntaId);
                const currentSRS: SRSState = currentSRSDB ? {
                    easinessFactor: Number(currentSRSDB.easiness_factor),
                    interval: currentSRSDB.interval,
                    repetitions: currentSRSDB.repetitions,
                    nextReviewDate: new Date() // Not used in calc
                } : {
                    easinessFactor: 2.5,
                    interval: 0,
                    repetitions: 0,
                    nextReviewDate: new Date()
                };

                const nextState = calculateNextSRS(currentSRS, quality);

                srsUpdates.push({
                    alumno_id: user.id,
                    pregunta_id: preguntaId,
                    easiness_factor: nextState.easinessFactor,
                    interval: nextState.interval,
                    repetitions: nextState.repetitions,
                    next_review_date: nextState.nextReviewDate.toISOString(),
                    last_reviewed_date: new Date().toISOString()
                });
            }

            if (srsUpdates.length > 0) {
                const { error: srsError } = await supabase
                    .from('progreso_preguntas')
                    .upsert(srsUpdates, { onConflict: 'alumno_id, pregunta_id' });

                if (srsError) console.error('Error updating SRS:', srsError);
            }
        }
        // ---------------------------------------

        return NextResponse.json({
            puntuacion: puntuacion.puntuacion,
            puntos_obtenidos: puntuacion.puntos_obtenidos,
            puntos_totales: puntuacion.puntos_totales,
            aprobado: puntuacion.aprobado,
            respuestas_correctas: respuestasCorrectas,
            nota_aprobado: intento.evaluacion.nota_aprobado,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nuevos_logros: nLogros?.map((la: any) => la.logro) || [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nuevas_habilidades: nHabilidades?.map((ha: any) => ha.skill) || []
        });
    } catch {
        return NextResponse.json(
            { error: 'Error al enviar evaluación' },
            { status: 500 }
        );
    }
}
