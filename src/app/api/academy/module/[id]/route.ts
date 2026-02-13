
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { verifyModuleAccess } from '@/lib/academy/enrollment';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const hasAccess = await verifyModuleAccess(user.id, params.id);

        if (!hasAccess) {
            // Standardizes on generic "Resource not found" to mask existence
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        const supabase = createClient();
        const { data: modulo, error: moduloError } = await supabase
            .from('modulos')
            .select(`
                id,
                curso_id,
                nombre_es,
                nombre_eu,
                descripcion_es,
                descripcion_eu,
                imagen_url,
                orden,
                curso:curso_id (
                    id,
                    slug,
                    nombre_es,
                    nombre_eu,
                    nivel_formacion:nivel_formacion_id (
                        slug,
                        nombre_es,
                        nombre_eu,
                        orden
                    )
                )
            `)
            .eq('id', params.id)
            .single();

        if (moduloError || !modulo) {
            return NextResponse.json(
                // Same message as above
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        const { data: unidades, error: unidadesError } = await supabase
            .from('unidades_didacticas')
            .select('id, nombre_es, nombre_eu, descripcion_es, descripcion_eu, duracion_estimada_min, orden, slug, objetivos_es, objetivos_eu')
            .eq('modulo_id', params.id)
            .order('orden');

        if (unidadesError) {
            console.error('Units fetch error:', unidadesError);
            return NextResponse.json(
                { error: 'Error loading units' },
                { status: 500 }
            );
        }

        let progresoModulo = null;
        let progresoUnidades: any[] = [];
        try {
            const { data: progresoMod } = await supabase
                .from('progreso_alumno')
                .select('*')
                .eq('alumno_id', user.id)
                .eq('tipo_entidad', 'modulo')
                .eq('entidad_id', params.id)
                .single();
            progresoModulo = progresoMod;

            if (unidades && unidades.length > 0) {
                const { data: progresoUni } = await supabase
                    .from('progreso_alumno')
                    .select('*')
                    .eq('alumno_id', user.id)
                    .eq('tipo_entidad', 'unidad')
                    .in('entidad_id', unidades.map(u => u.id));
                progresoUnidades = progresoUni || [];
            }
        } catch { }

        return NextResponse.json({
            modulo,
            unidades: unidades || [],
            progreso: progresoModulo,
            progreso_unidades: progresoUnidades
        });

    } catch (err) {
        console.error('Error fetching module:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
