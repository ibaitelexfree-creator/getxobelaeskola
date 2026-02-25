import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// Simple SRS implementation since we can't import the lib if it's missing or has issues
// Or we can define the interface for the result
interface SrsResult {
    interval: number;
    easeFactor: number;
    nextReview: Date;
}

// Re-implementing locally to avoid import issues or assuming signature
function calculateNextReview(currentInterval: number, currentEase: number, isCorrect: boolean): SrsResult {
    let nextInterval = 1;
    let nextEase = currentEase;

    if (isCorrect) {
        if (currentInterval === 0) {
            nextInterval = 1;
        } else if (currentInterval === 1) {
            nextInterval = 6;
        } else {
            nextInterval = Math.round(currentInterval * currentEase);
        }
    } else {
        nextInterval = 0;
        nextEase = Math.max(1.3, currentEase - 0.2);
    }

    // Adjust ease factor for success
    if (isCorrect) {
        nextEase = currentEase + 0.1;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    return {
        interval: nextInterval,
        easeFactor: nextEase,
        nextReview
    };
}

interface EvaluationAttempt {
    id: string;
    alumno_id: string;
    estado: string;
    respuestas_json: Record<string, string> | null;
    preguntas_json: string[]; // IDs
    evaluacion: {
        entidad_id: string;
        mostrar_respuestas: boolean;
        nota_aprobado: number;
    };
}

interface SrsUserQuestion {
    user_id: string;
    question_id: string;
    interval: number;
    ease_factor: number;
    next_review: string;
    last_answered: string;
}

interface Question {
    id: string;
    respuesta_correcta: string;
}

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
        const { data: intentoData, error: intentoError } = await supabase
            .from('intentos_evaluacion')
            .select('*, evaluacion:evaluacion_id(*)')
            .eq('id', intento_id)
            .eq('alumno_id', user.id)
            .single();

        if (intentoError || !intentoData) {
            return NextResponse.json({ error: 'Intento no encontrado' }, { status: 404 });
        }

        const intento = intentoData as unknown as EvaluationAttempt;

        if (intento.estado !== 'en_progreso') {
            return NextResponse.json({ error: 'Este intento ya fue completado' }, { status: 400 });
        }

        // Actualizar el intento con las respuestas
        const respuestasMerged: Record<string, string> = { ...(intento.respuestas_json || {}), ...respuestas };

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

        // Result from RPC is usually an array or object depending on definition
        const puntuacion = Array.isArray(resultado) ? resultado[0] : resultado;

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

        // 6. PROPAGAR PROGRESO
        const { error: rpcError } = await supabase.rpc('recalcular_progreso_alumno', {
            p_alumno_id: user.id,
            p_tipo_entidad: 'unidad',
            p_entidad_id: intento.evaluacion.entidad_id
        });

        if (rpcError) {
            console.error('Error en recalcular_progreso_alumno:', rpcError);
        }

        // 7. ACTUALIZAR RACHA
        try {
            if (puntuacion.aprobado) {
                await supabase.rpc('incrementar_racha_quizzes', { p_alumno_id: user.id });
            } else {
                await supabase.rpc('resetear_racha_quizzes', { p_alumno_id: user.id });
            }
        } catch {
            // No bloqueamos por la racha
        }

        // 8. BUSCAR LOGROS Y HABILIDADES RECIENTES
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
            const { data: allQuestions } = await supabaseAdmin
                .from('preguntas')
                .select('id, respuesta_correcta')
                .in('id', intento.preguntas_json);

            if (allQuestions && allQuestions.length > 0) {
                // Obtener estado SRS actual
                const questionIds = allQuestions.map((q: any) => q.id);
                const { data: currentSrs } = await supabase
                    .from('srs_user_questions')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('question_id', questionIds);

                const srsMap = new Map<string, SrsUserQuestion>();
                if (currentSrs) {
                    currentSrs.forEach((s: any) => srsMap.set(s.question_id, s));
                }

                const updates: SrsUserQuestion[] = [];
                for (const q of (allQuestions as Question[])) {
                    const userAnswer = respuestasMerged[q.id];
                    // Si no respondió, consideramos incorrecto
                    const isCorrect = userAnswer === q.respuesta_correcta;

                    const current = srsMap.get(q.id) || { interval: 0, ease_factor: 2.5 };

                    // We use local simple function or import. Since I inlined it to be safe:
                    // Using interval and ease_factor from current (checking types)
                    const currentInterval = typeof current.interval === 'number' ? current.interval : 0;
                    const currentEase = typeof current.ease_factor === 'number' ? current.ease_factor : 2.5;

                    const next = calculateNextReview(currentInterval, currentEase, isCorrect);

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
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: 'Error al enviar evaluación' },
            { status: 500 }
        );
    }
}
