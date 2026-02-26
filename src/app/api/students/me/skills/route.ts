import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

<<<<<<< HEAD
export async function GET() {
=======
export async function GET(request: Request) {
>>>>>>> pr-286
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 1. Obtener todas las habilidades
        const { data: allSkills, error: skillsError } = await supabase
            .from('skills')
            .select('*');

        if (skillsError) {
            console.error('Error fetching skills:', skillsError);
            return NextResponse.json({ error: 'Error al obtener habilidades' }, { status: 500 });
        }

        // 2. Obtener las habilidades desbloqueadas por el alumno
        const { data: unlockedSkills, error: unlockedError } = await supabase
            .from('student_skills')
            .select('skill_id, unlocked_at, source_type, source_id')
            .eq('student_id', user.id);

        if (unlockedError) {
            console.error('Error fetching unlocked skills:', unlockedError);
            return NextResponse.json({ error: 'Error al obtener progreso de habilidades' }, { status: 500 });
        }

        // 3. Crear mapa de desbloqueadas
        const unlockedMap = new Map();
        unlockedSkills?.forEach(item => {
            unlockedMap.set(item.skill_id, item);
        });

        // 4. Combinar y formatear
        const responseSkills = allSkills.map(skill => {
            const unlockedData = unlockedMap.get(skill.id);
            return {
                id: skill.id,
                name: skill.name,
                description: skill.description,
                icon: skill.icon,
                category: skill.category,
                unlocked_at: unlockedData ? unlockedData.unlocked_at : null,
                source_type: unlockedData ? unlockedData.source_type : null,
                source_id: unlockedData ? unlockedData.source_id : null
            };
        });

        // 5. Ordenar por unlocked_at DESC (desbloqueadas primero, más recientes arriba)
        responseSkills.sort((a, b) => {
            if (a.unlocked_at && b.unlocked_at) {
                return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
            }
            if (a.unlocked_at) return -1; // a tiene fecha, b no -> a va antes
            if (b.unlocked_at) return 1;  // b tiene fecha, a no -> b va antes
            return 0; // ambos null
        });

        return NextResponse.json(responseSkills);

    } catch (error) {
        console.error('Unexpected error in GET skills:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
