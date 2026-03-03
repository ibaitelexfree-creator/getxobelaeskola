import { createClient } from '@/lib/supabase/server';

export async function getStudentRecommendations(studentId: string): Promise<string[]> {
    const supabase = await createClient();

    // 1. Obtener intentos recientes (últimos 20)
    const { data: intentos, error: intentosError } = await supabase
        .from('intentos_evaluacion')
        .select('preguntas_json, respuestas_json')
        .eq('alumno_id', studentId)
        .order('fecha_inicio', { ascending: false })
        .limit(20);

    if (intentosError || !intentos || intentos.length === 0) {
        return [];
    }

    // 2. Recolectar IDs de todas las preguntas involucradas
    const questionIds = new Set<string>();

    intentos.forEach(intento => {
        const preguntas = intento.preguntas_json;
        if (Array.isArray(preguntas)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            preguntas.forEach((id: any) => {
                if (typeof id === 'string') questionIds.add(id);
            });
        }
    });

    if (questionIds.size === 0) {
        return [];
    }

    // 3. Obtener detalles de las preguntas (para ver la respuesta correcta y la entidad)
    const { data: preguntas, error: preguntasError } = await supabase
        .from('preguntas')
        .select('id, respuesta_correcta, entidad_id, entidad_tipo')
        .in('id', Array.from(questionIds));

    if (preguntasError || !preguntas) {
        return [];
    }

    // Mapa para acceso rápido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preguntasMap = new Map(preguntas.map((p: any) => [p.id, p]));

    // 4. Analizar fallos y recolectar entidades a reforzar
    const entidadesRefuerzo = new Set<string>();

    intentos.forEach(intento => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const respuestas = intento.respuestas_json as Record<string, any>;
        if (!respuestas) return;

        const preguntasArr = intento.preguntas_json;
        if (!Array.isArray(preguntasArr)) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preguntasArr.forEach((qId: any) => {
            if (typeof qId !== 'string') return;

            const pregunta = preguntasMap.get(qId);
            if (!pregunta) return;

            const respuestaAlumno = respuestas[qId];

            // Comparación de respuesta (asumiendo string o coincidencia exacta)
            // Si la respuesta es incorrecta, añadir la entidad a reforzar
            if (respuestaAlumno !== pregunta.respuesta_correcta) {
                // Generar URI según el tipo de entidad
                let uri = '';
                switch (pregunta.entidad_tipo) {
                    case 'unidad':
                        uri = `/academy/unit/${pregunta.entidad_id}`;
                        break;
                    case 'modulo':
                        uri = `/academy/module/${pregunta.entidad_id}`;
                        break;
                    case 'curso':
                        uri = `/academy/course/${pregunta.entidad_id}`;
                        break;
                }

                if (uri) {
                    entidadesRefuerzo.add(uri);
                }
            }
        });
    });

    return Array.from(entidadesRefuerzo);
}
