import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/academy/certificates/[id]
 * Obtiene el detalle completo de un certificado específico (Fase 9).
 * Incluye habilidades demostradas por el alumno.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // Obtener certificado con información completa
        const { data: certificado, error } = await supabase
            .from('certificados')
            .select(`
                id,
                tipo,
                numero_certificado,
                fecha_emision,
                nota_final,
                nivel_distincion,
                distincion,
                curso:curso_id (
                    id,
                    nombre_es,
                    nombre_eu,
                    descripcion_es,
                    descripcion_eu
                ),
                nivel:nivel_id (
                    id,
                    nombre_es,
                    nombre_eu,
                    descripcion_es,
                    descripcion_eu
                ),
                perfil:alumno_id (
                    full_name,
                    email
                )
            `)
            .eq('id', params.id)
            .eq('alumno_id', user.id) // Seguridad: solo sus propios certificados
            .single();

        if (error || !certificado) {
            return NextResponse.json({
                error: 'Certificado no encontrado'
            }, { status: 404 });
        }

        // Obtener habilidades del alumno
        const { data: habilidades } = await supabase
            .from('student_skills')
            .select(`
                obtained_at,
                skill:skill_id (
                    slug,
                    nombre_es,
                    nombre_eu,
                    icono,
                    categoria
                )
            `)
            .eq('student_id', user.id)
            .order('obtained_at', { ascending: false });

        return NextResponse.json({
            certificado,
            habilidades_demostradas: habilidades || []
        });

    } catch (error) {
        console.error('Error al obtener detalle de certificado:', error);
        return NextResponse.json(
            { error: 'Error al obtener certificado' },
            { status: 500 }
        );
    }
}
