import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withCors, corsHeaders } from '@/lib/api-headers';

/**
 * Registra la lectura de una sección de una unidad (Teoría, Práctica o Errores)
 * y recalcula el progreso de la unidad.
 */
export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request)
    });
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return withCors(NextResponse.json({ error: 'No autenticado' }, { status: 401 }), request);
        }

        const body = await request.json();
        const { unidad_id, seccion } = body; // seccion: 'teoria' | 'practica' | 'errores'

        if (!unidad_id || !seccion) {
            return withCors(NextResponse.json({ error: 'Faltan datos requeridos (unidad_id, seccion)' }, { status: 400 }), request);
        }

        // --- HARDENING: VALIDAR ACCESO (Fase 6.5) ---
        // Verificar si el alumno tiene permiso para acceder a esta unidad
        const { data: tieneAcceso, error: accessError } = await supabase.rpc('puede_acceder_entidad', {
            p_alumno_id: user.id,
            p_tipo_entidad: 'unidad',
            p_entidad_id: unidad_id
        });

        if (accessError || !tieneAcceso) {
            console.warn(`Intento de acceso no autorizado a unidad ${unidad_id} por usuario ${user.id}`);
            return withCors(NextResponse.json({ error: 'Acceso denegado: La unidad está bloqueada.' }, { status: 403 }), request);
        }
        // ---------------------------------------------

        // 2. Obtener progreso actual para ver secciones vistas
        const { data: progresoActual } = await supabase
            .from('progreso_alumno')
            .select('secciones_vistas')
            .eq('alumno_id', user.id)
            .eq('tipo_entidad', 'unidad')
            .eq('entidad_id', unidad_id)
            .single();

        let seccionesVistas = progresoActual?.secciones_vistas || [];
        if (!Array.isArray(seccionesVistas)) seccionesVistas = [];

        // 3. Añadir la nueva sección si no estaba ya
        if (!seccionesVistas.includes(seccion)) {
            seccionesVistas.push(seccion);
        }

        // 4. Upsert del progreso mínimo (para asegurar que existe)
        const { error: upsertError } = await supabase
            .from('progreso_alumno')
            .upsert({
                alumno_id: user.id,
                tipo_entidad: 'unidad',
                entidad_id: unidad_id,
                secciones_vistas: seccionesVistas,
                estado: 'en_progreso',
                fecha_inicio: new Date().toISOString()
            }, {
                onConflict: 'alumno_id,tipo_entidad,entidad_id'
            });

        if (upsertError) {
            return withCors(NextResponse.json({ error: upsertError.message }, { status: 500 }), request);
        }

        // 5. Llamar a la función RPC para recalcular y propagar
        const { data: resultado, error: rpcError } = await supabase
            .rpc('recalcular_progreso_alumno', {
                p_alumno_id: user.id,
                p_tipo_entidad: 'unidad',
                p_entidad_id: unidad_id
            });

        if (rpcError) {
            console.error('RPC recalcular_progreso_alumno failed:', rpcError);
            return withCors(NextResponse.json({
                success: true,
                warning: 'Secciones guardadas pero fallo en recalculo automático',
                secciones: seccionesVistas
            }), request);
        }

        return withCors(NextResponse.json({
            success: true,
            progreso: resultado
        }), request);

    } catch (error) {
        console.error('Error in unit-read API:', error);
        return withCors(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }), request);
    }
}
