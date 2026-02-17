
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { getUserEnrollments } from '@/lib/academy/enrollment';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. AUTHENTICATION
        const { user, profile, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const role = profile?.rol;
        const isStaff = role === 'admin' || role === 'instructor';

        // 2. AUTHORIZATION SOURCE
        // Explicitly get enrolled course IDs.
        const enrolledCourseIds = isStaff ? [] : await getUserEnrollments(user.id);

        const supabase = createClient();

        // 3. FETCH LOCKED/UNLOCKED STATUS
        // We use the existing RPC but we must filter the results.
        const { data: unlockStatus, error: rpcError } = await supabase
            .rpc('obtener_estado_desbloqueo_recursivo', {
                p_alumno_id: user.id
            });

        if (rpcError) {
            console.error('Error in unlock-status RPC:', rpcError);
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            );
        }

        // 4. FILTER & HARDEN
        // If staff, we unlock EVERYTHING.
        if (isStaff) {
            const unlockAll = (map: Record<string, string>) => {
                const newMap: Record<string, string> = {};
                Object.keys(map || {}).forEach(id => {
                    if (map[id] === 'locked' || map[id] === 'bloqueado') {
                        newMap[id] = 'available';
                    } else {
                        newMap[id] = map[id];
                    }
                });
                return newMap;
            };

            return NextResponse.json({
                niveles: unlockAll(unlockStatus.niveles || {}),
                cursos: unlockAll(unlockStatus.cursos || {}),
                modulos: unlockAll(unlockStatus.modulos || {}),
                unidades: unlockAll(unlockStatus.unidades || {})
            });
        }

        const filteredCourses: Record<string, string> = {};

        // 1. Ensure ALL enrolled courses are available
        enrolledCourseIds.forEach(id => {
            filteredCourses[id] = 'available';
        });

        const coursesMap = unlockStatus.cursos || {};

        // 2. Integrate RPC status
        Object.keys(coursesMap).forEach(courseId => {
            const isEnrolled = enrolledCourseIds.includes(courseId);
            if (isEnrolled) {
                // Keep it available if enrolled
                filteredCourses[courseId] = 'available';
            } else {
                // If not enrolled, it is locked
                filteredCourses[courseId] = 'bloqueado';
            }
        });

        // We should also filter modules/units belonging to locked courses,
        // but client-side logic handles this via hierarchical checks usually.
        // For robustness, returning 'bloqueado' for the course is often enough for the UI to disable children.


        // Filter Levels: If a user has an enrolled course in a level, that level should be available
        const filteredLevels: Record<string, string> = { ...(unlockStatus.niveles || {}) };
        const { data: levelMappings } = await supabase
            .from('cursos')
            .select('nivel_formacion_id')
            .in('id', enrolledCourseIds);

        const enrolledLevelIds = (levelMappings || []).map(m => m.nivel_formacion_id).filter(Boolean);

        // Ensure all enrolled levels are marked available
        enrolledLevelIds.forEach(id => {
            if (id) filteredLevels[id] = 'available';
        });

        // Filter Modules: If they belong to an enrolled course, they should be available
        const filteredModules: Record<string, string> = { ...(unlockStatus.modulos || {}) };
        const { data: moduleMappings } = await supabase
            .from('modulos')
            .select('id')
            .in('curso_id', enrolledCourseIds);

        const enrolledModuleIds = (moduleMappings || []).map(m => m.id);

        // Ensure all enrolled modules are marked available
        enrolledModuleIds.forEach(id => {
            filteredModules[id] = 'available';
        });

        // Filter Units: If they belong to an enrolled module, they should be available
        const filteredUnits: Record<string, string> = { ...(unlockStatus.unidades || {}) };
        const { data: unitMappings } = await supabase
            .from('unidades_didacticas')
            .select('id')
            .in('modulo_id', enrolledModuleIds);

        const enrolledUnitIds = (unitMappings || []).map(u => u.id);

        // Ensure all enrolled units are marked available
        enrolledUnitIds.forEach(id => {
            filteredUnits[id] = 'available';
        });

        // 5. RESPONSE
        return NextResponse.json({
            ...unlockStatus,
            niveles: filteredLevels,
            cursos: filteredCourses,
            modulos: filteredModules,
            unidades: filteredUnits
        });

    } catch (err) {
        console.error('Error in unlock-status endpoint:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
