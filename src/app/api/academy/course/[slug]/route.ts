
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { verifyCourseAccess } from '@/lib/academy/enrollment';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        // 1. AUTHENTICATION
        const { user, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. AUTHORIZATION (CRITICAL)
        const hasAccess = await verifyCourseAccess(user.id, params.slug);

        if (!hasAccess) {
            // Standardized Anti-Enumeration Response
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        // 3. DATA FETCH
        const supabase = createClient();

        const { data: curso, error: cursoError } = await supabase
            .from('cursos')
            .select(`
                id,
                slug,
                nombre_es,
                nombre_eu,
                descripcion_es,
                descripcion_eu,
                imagen_url,
                duracion_h,
                nivel_formacion:nivel_formacion_id (
                    id,
                    slug,
                    nombre_es,
                    nombre_eu,
                    orden
                ),
                categoria:categoria_id (
                    nombre_es,
                    nombre_eu
                ),
                instructor:instructor_id (
                    nombre,
                    foto_url
                )
            `)
            .eq('slug', params.slug)
            .eq('activo', true)
            .single();

        if (cursoError || !curso) {
            console.error('Course fetch error:', cursoError);
            // Standardized Anti-Enumeration Response
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        const { data: modulos, error: modulosError } = await supabase
            .from('modulos')
            .select('id, nombre_es, nombre_eu, descripcion_es, descripcion_eu, orden')
            .eq('curso_id', curso.id)
            .order('orden');

        const modulosConUnidades = await Promise.all(
            (modulos || []).map(async (modulo) => {
                const { count } = await supabase
                    .from('unidades_didacticas')
                    .select('*', { count: 'exact', head: true })
                    .eq('modulo_id', modulo.id);

                return {
                    ...modulo,
                    num_unidades: count || 0
                };
            })
        );

        let progreso = null;
        try {
            const { data: progresoData } = await supabase
                .from('progreso_alumno')
                .select('*')
                .eq('alumno_id', user.id)
                .eq('tipo_entidad', 'curso')
                .eq('entidad_id', curso.id)
                .single();

            progreso = progresoData;
        } catch { }

        return NextResponse.json({
            curso,
            modulos: modulosConUnidades,
            progreso
        });

    } catch (err) {
        console.error('Error fetching course:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
