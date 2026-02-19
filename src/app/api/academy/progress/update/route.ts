
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { tipo_entidad, entidad_id, estado, porcentaje } = await request.json();

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Validate Input
        if (!['nivel', 'curso', 'modulo', 'unidad'].includes(tipo_entidad)) {
            return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
        }

        // 3. Upsert Progress
        const { data: progress, error: upsertError } = await supabase
            .from('progreso_alumno')
            .upsert({
                alumno_id: user.id,
                tipo_entidad,
                entidad_id,
                estado,
                porcentaje,
                fecha_completado: estado === 'completado' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (upsertError) {
            console.error('Error updating progress:', upsertError);
            return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
        }

        // 4. Trigger Check for Achievements & Skills (Basic Implementation)
        const newUnlocks = {
            achievements: [],
            skills: []
        };

        // --- Check Achievements ---
        // Fetch all achievements that are NOT already unlocked
        const { data: userAchievements } = await supabase
            .from('logros_alumno')
            .select('logro_id')
            .eq('alumno_id', user.id);

        const unlockedIds = userAchievements?.map((a: any) => a.logro_id) || [];

        const { data: allAchievements } = await supabase
            .from('logros')
            // @ts-ignore
            .select('*')
            .not('id', 'in', `(${unlockedIds.join(',')})`); // This might fail if empty list, handle properly in code

        if (allAchievements && allAchievements.length > 0) {
            // Fetch stats needed for evaluation
            const { count: completedUnits } = await supabase
                .from('progreso_alumno')
                .select('*', { count: 'exact', head: true })
                .eq('alumno_id', user.id)
                .eq('tipo_entidad', 'unidad')
                .eq('estado', 'completado');

            for (const achievement of allAchievements) {
                const condition = achievement.condicion_json;
                let unlocked = false;

                if (condition) {
                    if (condition.tipo === 'unidades_completadas') {
                        if ((completedUnits || 0) >= condition.cantidad) unlocked = true;
                    }
                    // Add more condition checks here
                }

                if (unlocked) {
                    const { error: unlockError } = await supabase
                        .from('logros_alumno')
                        .insert({
                            alumno_id: user.id,
                            logro_id: achievement.id
                        });

                    if (!unlockError) {
                        // @ts-ignore
                        newUnlocks.achievements.push(achievement);
                    }
                }
            }
        }

        // --- Check Skills ---
        // Basic check: if 'nivel_requerido' is met (this requires fetching user level progress)
        // Or if 'modulo_desbloqueo_id' matches the completed entity

        if (tipo_entidad === 'modulo' && estado === 'completado') {
            const { data: skillsToUnlock } = await supabase
                .from('habilidades')
                .select('*')
                .eq('modulo_desbloqueo_id', entidad_id);

            if (skillsToUnlock && skillsToUnlock.length > 0) {
                for (const skill of skillsToUnlock) {
                    const { error: skillError } = await supabase
                        .from('habilidades_alumno')
                        .insert({
                            alumno_id: user.id,
                            habilidad_id: skill.id
                        })
                        .ignoreDuplicates(); // In case already unlocked

                    if (!skillError) {
                        // @ts-ignore
                        newUnlocks.skills.push(skill);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            progress,
            new_unlocks: newUnlocks
        });

    } catch (error) {
        console.error('Unexpected error in progress update API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
