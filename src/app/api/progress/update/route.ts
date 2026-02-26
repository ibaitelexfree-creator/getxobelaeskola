import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withCors, corsHeaders } from '@/lib/api-headers';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request)
    });
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Obtener el usuario autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return withCors(NextResponse.json({ error: 'No autenticado' }, { status: 401 }), request);
        }

        const body = await request.json();
        const { tipo_entidad, entidad_id, estado } = body;

        // Validar datos
        if (!tipo_entidad || !entidad_id) {
            return withCors(NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            ), request);
        }

        // --- HARDENING: VALIDAR ACCESO (Fase 15) ---
        // Prevenir que un alumno active progreso de algo que no puede ver
        const { data: tieneAcceso, error: accessError } = await supabase.rpc('puede_acceder_entidad', {
            p_alumno_id: user.id,
            p_tipo_entidad: tipo_entidad,
            p_entidad_id: entidad_id
        });

        if (accessError || !tieneAcceso) {
            return withCors(NextResponse.json({
                error: 'Acceso denegado: El contenido está bloqueado.',
                reason: 'locked_content'
            }, { status: 403 }), request);
        }

        // Prevenir completado manual si hay quiz
        if (tipo_entidad === 'unidad' && estado === 'completado') {
            const { data: quiz } = await supabase
                .from('evaluaciones')
                .select('id')
                .eq('entidad_tipo', 'unidad')
                .eq('entidad_id', entidad_id)
                .limit(1)
                .maybeSingle();

            if (quiz) {
                return withCors(NextResponse.json({
                    error: 'Esta unidad requiere aprobar el quiz para completarse.',
                    requires_quiz: true
                }, { status: 403 }), request);
            }
        }
        // -------------------------------------------

        // --- ACTUALIZAR PROGRESO USANDO RPC MAESTRO (Fase 17) ---
        // El RPC se encarga de:
        // 1. Actualizar el registro actual.
        // 2. Propagar en cascada (Modulo -> Curso -> Nivel).
        // 3. Desbloquear el siguiente contenido.
        // 4. Emitir certificados si corresponde (vía triggers).
        const { data: resultado, error: rpcError } = await supabase.rpc('recalcular_progreso_alumno', {
            p_alumno_id: user.id,
            p_tipo_entidad: tipo_entidad,
            p_entidad_id: entidad_id
        });

        if (rpcError) {
            console.error('Error en recalcular_progreso_alumno:', rpcError);
            return withCors(NextResponse.json({ error: rpcError.message }, { status: 500 }), request);
        }

        // BUSCAR LOGROS Y HABILIDADES RECIENTES (Fase 13 - Integración)
        // Usamos un buffer de tiempo para detectar lo que el trigger acaba de insertar
        const secondsBuffer = 5;
        const now = new Date();
        const bufferTime = new Date(now.getTime() - secondsBuffer * 1000).toISOString();

        // Nota: student_skills y logros_alumno son las tablas activas según migraciones
        const { data: nuevosLogros } = await supabase
            .from('logros_alumno')
            .select(`*, logro:logro_id(*)`)
            .eq('alumno_id', user.id)
            .gte('fecha_obtenido', bufferTime);

        const { data: nuevasHabilidades } = await supabase
            .from('student_skills')
            .select(`*, habilidad:skill_id(*)`)
            .eq('student_id', user.id)
            .gte('unlocked_at', bufferTime);

        return withCors(NextResponse.json({
            progreso: resultado,
            feedback: {
                logros: nuevosLogros?.map((l: any) => l.logro) || [],
                habilidades: nuevasHabilidades?.map((h: any) => h.habilidad) || []
            }
        }), request);
    } catch (error) {
        console.error('Error crítico en progress update:', error);
        return withCors(NextResponse.json(
            { error: 'Error interno al actualizar progreso' },
            { status: 500 }
        ), request);
    }
}
