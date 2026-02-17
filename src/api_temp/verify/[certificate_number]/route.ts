import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { certificate_number: string } }
) {
    try {
        const supabase = await createClient();
        const { certificate_number } = params;

        if (!certificate_number) {
            return NextResponse.json({ error: 'Número de certificado no proporcionado' }, { status: 400 });
        }

        // Buscar el certificado con datos relacionados (alumno, curso, nivel)
        // Usamos una consulta que traiga nombres legibles
        const { data: certificado, error } = await supabase
            .from('certificados')
            .select(`
                *,
                profile:alumno_id (
                    full_name
                ),
                curso:curso_id (
                    nombre_es,
                    nombre_eu
                ),
                nivel:nivel_id (
                    nombre_es,
                    nombre_eu
                )
            `)
            .eq('numero_certificado', certificate_number)
            .single();

        if (error || !certificado) {
            return NextResponse.json({
                valid: false,
                message: 'Certificado no encontrado o inválido'
            }, { status: 404 });
        }

        return NextResponse.json({
            valid: true,
            data: {
                numero: certificado.numero_certificado,
                alumno: certificado.profile?.full_name || 'Navegante Anónimo',
                tipo: certificado.tipo,
                entidad: certificado.tipo === 'curso' ? certificado.curso : certificado.nivel,
                fecha_emision: certificado.fecha_emision,
                nota_final: certificado.nota_final,
                distincion: certificado.distincion, // Binario (legacy)
                nivel_distincion: certificado.nivel_distincion || 'estandar' // Fase 9: 3 niveles
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Error al verificar certificado' },
            { status: 500 }
        );
    }
}
