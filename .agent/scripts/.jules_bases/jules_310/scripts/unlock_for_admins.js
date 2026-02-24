
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
CREATE OR REPLACE FUNCTION public.obtener_estado_desbloqueo_recursivo(p_alumno_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_rol TEXT;
BEGIN
    -- Verificar si el usuario es admin o instructor
    SELECT rol INTO v_rol FROM public.profiles WHERE id = p_alumno_id;

    IF v_rol IN ('admin', 'instructor') THEN
        -- Para administradores e instructores, todo está disponible
        WITH 
        niveles_estado AS (SELECT id, 'disponible' as estado FROM public.niveles_formacion),
        cursos_estado AS (SELECT id, 'disponible' as estado FROM public.cursos),
        modulos_estado AS (SELECT id, 'disponible' as estado FROM public.modulos),
        unidades_estado AS (SELECT id, 'disponible' as estado FROM public.unidades_didacticas)
        SELECT jsonb_build_object(
            'niveles', (SELECT jsonb_object_agg(id, estado) FROM niveles_estado),
            'cursos', (SELECT jsonb_object_agg(id, estado) FROM cursos_estado),
            'modulos', (SELECT jsonb_object_agg(id, estado) FROM modulos_estado),
            'unidades', (SELECT jsonb_object_agg(id, estado) FROM unidades_estado)
        ) INTO v_resultado;
        
        RETURN v_resultado;
    END IF;

    -- Lógica normal para alumnos
    WITH 
    niveles_estado AS (
        SELECT 
            n.id, 
            COALESCE(p.estado, 'bloqueado') as estado
        FROM public.niveles_formacion n
        LEFT JOIN public.progreso_alumno p ON n.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'nivel'
    ),
    cursos_estado AS (
        SELECT 
            c.id, 
            c.nivel_formacion_id as parent_id,
            CASE 
                WHEN ne.estado = 'bloqueado' THEN 'bloqueado'
                ELSE COALESCE(p.estado, 'bloqueado')
            END as estado
        FROM public.cursos c
        JOIN niveles_estado ne ON c.nivel_formacion_id = ne.id
        LEFT JOIN public.progreso_alumno p ON c.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'course'
    ),
    modulos_estado AS (
        SELECT 
            m.id, 
            m.curso_id as parent_id,
            CASE 
                WHEN ce.estado = 'bloqueado' THEN 'bloqueado'
                ELSE COALESCE(p.estado, 'bloqueado')
            END as estado
        FROM public.modulos m
        JOIN cursos_estado ce ON m.curso_id = ce.id
        LEFT JOIN public.progreso_alumno p ON m.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'modulo'
    ),
    unidades_estado AS (
        SELECT 
            u.id, 
            u.modulo_id as parent_id,
            CASE 
                WHEN me.estado = 'bloqueado' THEN 'bloqueado'
                ELSE COALESCE(p.estado, 'bloqueado')
            END as estado
        FROM public.unidades_didacticas u
        JOIN modulos_estado me ON u.modulo_id = me.id
        LEFT JOIN public.progreso_alumno p ON u.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'unidad'
    )
    SELECT jsonb_build_object(
        'niveles', (SELECT jsonb_object_agg(id, estado) FROM niveles_estado),
        'cursos', (SELECT jsonb_object_agg(id, estado) FROM cursos_estado),
        'modulos', (SELECT jsonb_object_agg(id, estado) FROM modulos_estado),
        'unidades', (SELECT jsonb_object_agg(id, estado) FROM unidades_estado)
    ) INTO v_resultado;

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;
`;

async function applySql() {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
        console.error('Error applying SQL:', error);
        console.log('Trying alternative: direct update if exec_sql is not available...');
        // If exec_sql doesn't exist, we might need to rely on the API side.
    } else {
        console.log('✅ RPC updated successfully.');
    }
}

applySql();
