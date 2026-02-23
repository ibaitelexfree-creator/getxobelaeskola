
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

        // 2. AUTHORIZATION (Optional for base info, required for full content)
        const hasAccess = await verifyCourseAccess(user.id, params.slug);

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

        // OPTIMIZATION: Fetch unit counts in a single query instead of N+1
        let counts: Record<string, number> = {};
        const modulosList = modulos || [];

        if (modulosList.length > 0) {
            const moduloIds = modulosList.map((m) => m.id);
            const { data: unidades, error: unidadesError } = await supabase
                .from('unidades_didacticas')
                .select('modulo_id')
                .in('modulo_id', moduloIds);

            if (unidadesError) {
                console.error('Error fetching units count:', unidadesError);
            } else if (unidades) {
                counts = unidades.reduce((acc: Record<string, number>, unit: any) => {
                    const mId = unit.modulo_id;
                    if (mId) {
                        acc[mId] = (acc[mId] || 0) + 1;
                    }
                    return acc;
                }, {});
            }
        }

        const modulosConUnidades = modulosList.map((modulo) => ({
            ...modulo,
            num_unidades: counts[modulo.id] || 0
        }));

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
            progreso,
            isEnrolled: hasAccess
        });


    } catch (err) {
        console.error('Error fetching course:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
