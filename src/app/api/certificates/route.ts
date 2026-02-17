import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: certificates, error } = await supabase
        .from('certificados')
        .select(`
            id,
            tipo,
            numero_certificado,
            verificacion_hash,
            fecha_emision,
            nota_final,
            nivel_distincion,
            curso:curso_id (id, nombre_es, nombre_eu),
            nivel:nivel_id (id, nombre_es, nombre_eu),
            perfil:alumno_id (full_name)
        `)
        .eq('alumno_id', user.id)
        .order('fecha_emision', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        certificados: certificates || [],
        total: certificates?.length || 0
    });
}
