import { createClient } from '@supabase/supabase-js'; // Cliente directo para Service Role
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    const hash = params.hash;

    // Crear cliente admin para saltar RLS (Verificación Pública)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { data: certificate, error } = await supabaseAdmin
            .from('certificados')
            .select(`
                *,
                alumno:profiles(full_name, email),
                curso:cursos(nombre_es, nombre_eu),
                nivel:niveles_formacion(nombre_es, nombre_eu)
            `)
            .eq('verificacion_hash', hash)
            .single();

        if (error || !certificate) {
            console.error('Error fetching certificate:', error);
            return NextResponse.json({ error: 'Certificado no encontrado o inválido' }, { status: 404 });
        }

        // Determinar nombre de la entidad
        let entidadNombre = '';
        if (certificate.tipo === 'curso' && certificate.curso) {
            entidadNombre = certificate.curso.nombre_es || certificate.curso.nombre_eu;
        } else if (certificate.tipo === 'nivel' && certificate.nivel) {
            entidadNombre = certificate.nivel.nombre_es || certificate.nivel.nombre_eu;
        } else if (certificate.tipo === 'diploma_capitan') {
            entidadNombre = 'Capitán de Vela (Diploma)';
        }

        // Formatear respuesta pública segura
        return NextResponse.json({
            valid: true,
            alumno: certificate.alumno?.full_name || 'Alumno Getxo Bela',
            tipo: certificate.tipo,
            entidad: entidadNombre,
            fecha_emision: certificate.fecha_emision,
            numero: certificate.numero_certificado,
            distincion: certificate.distincion, // boolean
            nivel_distincion: certificate.nivel_distincion || 'estandar', // enum
            nota_final: certificate.nota_final
        });

    } catch (err) {
        console.error('Error interno verificando certificado:', err);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
