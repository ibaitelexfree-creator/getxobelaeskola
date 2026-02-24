import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/academy/skills
 * Devuelve:
 * - Catálogo completo de 12 habilidades con estado (obtenida/no obtenida)
 * - Rango actual del navegante (Grumete → Capitán)
 * - Progreso hacia el siguiente rango
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const alumnoId = user.id;

        // 1. Obtener el catálogo de habilidades con estado usando RPC
        const { data: habilidades, error: errorHabilidades } = await supabase
            .rpc('obtener_habilidades_alumno', {
                p_alumno_id: alumnoId,
            });

        if (errorHabilidades) {
            console.error('Error al obtener habilidades:', errorHabilidades);
            return NextResponse.json(
                { error: 'Error al obtener habilidades' },
                { status: 500 }
            );
        }

        // 2. Calcular rango del navegante usando RPC
        const { data: rangoData, error: errorRango } = await supabase
            .rpc('calcular_rango_navegante', {
                p_alumno_id: alumnoId,
            });

        if (errorRango) {
            console.error('Error al calcular rango:', errorRango);
            return NextResponse.json(
                { error: 'Error al calcular rango' },
                { status: 500 }
            );
        }

        const rango = rangoData && rangoData.length > 0 ? rangoData[0] : null;

        // 3. Calcular progreso hacia siguiente rango
        const habilidadesObtenidas = rango?.habilidades_obtenidas || 0;
        let siguienteRango = '';
        let habilidadesFaltantes = 0;

        if (habilidadesObtenidas === 0) {
            siguienteRango = 'Marinero';
            habilidadesFaltantes = 1;
        } else if (habilidadesObtenidas >= 1 && habilidadesObtenidas < 4) {
            siguienteRango = 'Timonel';
            habilidadesFaltantes = 4 - habilidadesObtenidas;
        } else if (habilidadesObtenidas >= 4 && habilidadesObtenidas < 7) {
            siguienteRango = 'Patrón';
            habilidadesFaltantes = 7 - habilidadesObtenidas;
        } else if (habilidadesObtenidas >= 7 && habilidadesObtenidas < 10) {
            siguienteRango = 'Capitán';
            habilidadesFaltantes = 10 - habilidadesObtenidas;
        } else if (habilidadesObtenidas >= 10) {
            siguienteRango = 'Capitán (máximo)';
            habilidadesFaltantes = 0;
        }

        // 4. Separar habilidades obtenidas y bloqueadas
        const habilidadesObtenidas_ = habilidades?.filter((h: any) => h.obtenida) || [];
        const habilidadesBloqueadas = habilidades?.filter((h: any) => !h.obtenida) || [];

        // Respuesta
        return NextResponse.json({
            success: true,
            rango: {
                actual: rango?.rango || 'Grumete',
                icono: rango?.icono || '🟤',
                siguiente: siguienteRango,
                habilidadesFaltantes,
                progreso: {
                    obtenidas: habilidadesObtenidas,
                    total: 12,
                    porcentaje: Math.round((habilidadesObtenidas / 12) * 100),
                },
            },
            habilidades: {
                todas: habilidades || [],
                obtenidas: habilidadesObtenidas_,
                bloqueadas: habilidadesBloqueadas,
            },
            estadisticas: {
                totalHabilidades: 12,
                obtenidas: habilidadesObtenidas,
                porcentajeCompletado: Math.round((habilidadesObtenidas / 12) * 100),
                categorias: {
                    tecnica: habilidadesObtenidas_.filter((h: any) => h.categoria === 'tecnica').length,
                    tactica: habilidadesObtenidas_.filter((h: any) => h.categoria === 'tactica').length,
                    seguridad: habilidadesObtenidas_.filter((h: any) => h.categoria === 'seguridad').length,
                    meteorologia: habilidadesObtenidas_.filter((h: any) => h.categoria === 'meteorologia').length,
                    excelencia: habilidadesObtenidas_.filter((h: any) => h.categoria === 'excelencia').length,
                },
            },
        });
    } catch (error) {
        console.error('Error en GET /api/academy/skills:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}


/**
 * POST /api/academy/skills/evaluate
 * Fuerza la evaluación manual de habilidades (útil para testing)
 * Normalmente se ejecuta automáticamente vía trigger
 */
export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const alumnoId = user.id;

        // Ejecutar evaluación manual
        const { data: habilidadesNuevas, error } = await supabase
            .rpc('evaluar_habilidades', {
                p_alumno_id: alumnoId,
            });

        if (error) {
            console.error('Error al evaluar habilidades:', error);
            return NextResponse.json(
                { error: 'Error al evaluar habilidades' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            habilidadesNuevas: habilidadesNuevas || [],
            mensaje: habilidadesNuevas && habilidadesNuevas.length > 0
                ? `¡${habilidadesNuevas.length} nueva(s) habilidad(es) obtenida(s)!`
                : 'No hay nuevas habilidades en este momento',
        });
    } catch (error) {
        console.error('Error en POST /api/academy/skills/evaluate:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
