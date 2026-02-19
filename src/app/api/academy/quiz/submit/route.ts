
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { evaluacion_id, respuestas } = await request.json(); // answers: { [questionId: string]: string | number }

        // 1. Authenticate
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Evaluation & All Correct Answers
        const { data: quiz, error: quizError } = await supabase
            .from('evaluaciones')
            .select('*')
            .eq('id', evaluacion_id)
            .single();

        if (quizError || !quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        const { data: questions, error: questionsError } = await supabase
            .from('preguntas')
            .select('id, respuesta_correcta, tipo_pregunta')
            .eq('evaluacion_id', evaluacion_id);

        if (questionsError || !questions) {
            return NextResponse.json({ error: 'Questions not found' }, { status: 500 });
        }

        // 3. Calculate Score
        let correctCount = 0;
        const totalQuestions = questions.length;
        const incorrectQuestions = [];

        for (const q of questions) {
            const userAnswer = respuestas[q.id];

            // Basic comparison - improve for different question types (e.g. multi-select)
            // Assuming string equality for simplicity or number index
            // If answer is stored as JSON array or object, might need deeper comparison

            // Normalize: convert both to string for check if simple
            if (String(userAnswer) === String(q.respuesta_correcta)) {
                correctCount++;
            } else {
                incorrectQuestions.push(q.id);
            }
        }

        const scorePercent = (correctCount / totalQuestions) * 100;
        const passed = scorePercent >= (quiz.nota_aprobado || 50);

        // 4. Update Progress if Passed
        if (passed) {
            // Update entity progress
            // Mark entity as completed
            if (quiz.entidad_tipo && quiz.entidad_id) {
                const { error: progressError } = await supabase
                    .from('progreso_alumno')
                    .upsert({
                        alumno_id: user.id,
                        tipo_entidad: quiz.entidad_tipo,
                        entidad_id: quiz.entidad_id,
                        estado: 'completado',
                        porcentaje: 100, // Or scorePercent? Typically completion is 100%
                        fecha_completado: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'alumno_id, tipo_entidad, entidad_id' }); // Use unique constraint

                if (progressError) console.error('Error updating progress on quiz pass:', progressError);

                // Also trigger achievement check via internal logic or separate call?
                // For now, assume client might call /progress/update or logic handles it elsewhere
            }

            // Create Certificate if it's a final exam
            if (quiz.tipo === 'examen_final' || quiz.tipo === 'diploma_capitan') {
                // Determine certificate type
                // Generate certificate logic here or call a function
                // Assuming stored procedure or manual insert

                /*
                await supabase.from('certificados').insert({
                    alumno_id: user.id,
                    curso_id: quiz.entidad_id, // If entity is course
                    tipo: 'curso',
                    numero_certificado: `CERT-${Date.now()}`, // Use proper generator
                    nota_final: scorePercent,
                    distincion: scorePercent >= 90
                });
                */
            }
        }

        // 5. Log Attempt (Optional: create 'evaluaciones_alumno' or similar log table if exists, otherwise skip)
        // Schema for attempts wasn't in phase 2 SQL but maybe in phase 1? Or just ignore.

        return NextResponse.json({
            success: true,
            passed,
            score: scorePercent,
            correct_count: correctCount,
            total_questions: totalQuestions,
            incorrect_ids: incorrectQuestions, // Return incorrect IDs for feedback
            approved_threshold: quiz.nota_aprobado
        });

    } catch (error) {
        console.error('Unexpected error in quiz submit API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
