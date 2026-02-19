
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // 1. Authenticate
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Quiz Metadata
        const { data: quiz, error: quizError } = await supabase
            .from('evaluaciones')
            .select('*')
            .eq('id', id)
            .single();

        if (quizError || !quiz) {
            console.error('Quiz not found:', quizError);
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // 3. Fetch Questions
        // We exclude 'respuesta_correcta' to prevent cheating from network tab inspection
        const { data: questions, error: questionsError } = await supabase
            .from('preguntas')
            .select('id, evaluacion_id, enunciado_es, enunciado_eu, opciones_es, opciones_eu, tipo_pregunta, orden')
            .eq('evaluacion_id', id)
            .order('orden'); // or random?

        if (questionsError) {
            console.error('Error fetching questions:', questionsError);
            return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
        }

        return NextResponse.json({
            quiz,
            questions: questions || []
        });

    } catch (error) {
        console.error('Unexpected error in quiz API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
