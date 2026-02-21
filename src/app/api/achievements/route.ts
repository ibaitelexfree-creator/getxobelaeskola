import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 1. Catálogo completo de logros
        const { data: allAchievements, error: achievementsError } = await supabase
            .from('logros')
            .select('*')
            .order('rareza', { ascending: true });

        if (achievementsError) throw achievementsError;

        // 2. Logros obtenidos por el alumno
        const { data: userAchievements, error: userError } = await supabase
            .from('logros_alumno')
            .select('logro_id, fecha_obtenido')
            .eq('alumno_id', user.id);

        if (userError) throw userError;

        // Mapear el catálogo con el estado del alumno
        const results = allAchievements.map(achievement => {
            const userAchievement = userAchievements.find(ua => ua.logro_id === achievement.id);
            return {
                ...achievement,
                obtained: !!userAchievement,
                dateObtained: userAchievement?.fecha_obtenido || null
            };
        });

        return NextResponse.json(results);

    } catch (error) {
        console.error('Error achievements API:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { slug } = body;

        if (!slug) {
            return NextResponse.json({ error: 'Falta el slug del logro' }, { status: 400 });
        }

        // 1. Buscar el logro por slug
        const { data: achievement, error: achievementError } = await supabase
            .from('logros')
            .select('id, nombre_es, puntos')
            .eq('slug', slug)
            .single();

        if (achievementError || !achievement) {
            return NextResponse.json({ error: 'Logro no encontrado' }, { status: 404 });
        }

        // 2. Verificar si ya lo tiene
        const { data: existing, error: checkError } = await supabase
            .from('logros_alumno')
            .select('id')
            .eq('alumno_id', user.id)
            .eq('logro_id', achievement.id)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            return NextResponse.json({ message: 'Ya obtenido', new: false });
        }

        // 3. Insertar el logro
        const { error: insertError } = await supabase
            .from('logros_alumno')
            .insert({
                alumno_id: user.id,
                logro_id: achievement.id,
                fecha_obtenido: new Date().toISOString()
            });

        if (insertError) throw insertError;

        return NextResponse.json({
            message: 'Logro desbloqueado',
            new: true,
            achievement: {
                slug: achievement.slug,
                nombre_es: achievement.nombre_es,
                puntos: achievement.puntos
            }
        });

    } catch (error) {
        console.error('Error unlocking achievement:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
