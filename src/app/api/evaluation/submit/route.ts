import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { calculateNextReview } from '@/lib/srs';

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

        // --- SRS UPDATE LOGIC START ---
        try {
            // Obtener preguntas y respuestas correctas para calcular SRS
            // Usamos supabaseAdmin para ver respuestas correctas
            const { data: allQuestions } = await supabaseAdmin
                .from('preguntas')
                .select('id, respuesta_correcta')
                .in('id', intento.preguntas_json);

            if (allQuestions && allQuestions.length > 0) {
                // Obtener estado SRS actual
                const { data: currentSrs } = await supabase
                    .from('srs_user_questions')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('question_id', (allQuestions as any[]).map((q: any) => q.id));

                const srsMap = new Map();
                if (currentSrs) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    currentSrs.forEach((s: any) => srsMap.set(s.question_id, s));
                }

                const updates: any[] = [];
                for (const q of (allQuestions as any[])) {
                    const userAnswer = respuestasMerged[q.id];
                    // Si no respondió, consideramos incorrecto
                    const isCorrect = userAnswer === q.respuesta_correcta;

                    const current = srsMap.get(q.id) || { interval: 0, ease_factor: 2.5 };

                    const next = calculateNextReview(current.interval, current.ease_factor, isCorrect);

                    updates.push({
                        user_id: user.id,
                        question_id: q.id,
                        interval: next.interval,
                        ease_factor: next.easeFactor,
                        next_review: next.nextReview.toISOString(),
                        last_answered: new Date().toISOString()
                    });
                }

                if (updates.length > 0) {
                    await supabase.from('srs_user_questions').upsert(updates);
                }
            }
        } catch (e) {
            console.error("Error updating SRS:", e);
        }
        // --- SRS UPDATE LOGIC END ---

        // Obtener las respuestas correctas si está configurado para el cliente
        let respuestasCorrectas = null;
        if (intento.evaluacion.mostrar_respuestas) {
            // Ya las tenemos en allQuestions si hicimos SRS, pero necesitamos explanations y el formato correcto
            const { data: preguntas } = await supabaseAdmin
                .from('preguntas')
                .select('id, respuesta_correcta, explicacion_es, explicacion_eu')
                .in('id', intento.preguntas_json);

            respuestasCorrectas = preguntas;
        }

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
