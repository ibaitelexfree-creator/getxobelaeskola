
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
        // Staff Bypass
        if (isStaff) {
            const unlockAll = (map: Record<string, string>) => {
                const newMap: Record<string, string> = { ...(map || {}) };
                Object.keys(newMap).forEach(id => {
                    if (newMap[id] === 'locked' || newMap[id] === 'bloqueado') {
                        newMap[id] = 'available';
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

        const filteredLevels = { ...(unlockStatus.niveles || {}) };
        const filteredCourses = { ...(unlockStatus.cursos || {}) };
        const filteredModules = { ...(unlockStatus.modulos || {}) };
        const filteredUnits = { ...(unlockStatus.unidades || {}) };

        // 1. Process Enrolled Courses
        // Enrollment bypasses hierarchy blocks but NOT sequential blocks
        enrolledCourseIds.forEach(courseId => {
            if (filteredCourses[courseId] === 'bloqueado' || filteredCourses[courseId] === 'locked' || !filteredCourses[courseId]) {
                filteredCourses[courseId] = 'available';
            }
        });

        // 2. Fetch structural info to identify "First" elements if needed
        // but for now, we trust the DB's verficar_desbloqueos_dependencias if it ran.
        // If it didn't run, we might need a manual boost here for the first unit of an enrolled course.

        // 3. (Optional) Force first module of enrolled courses to be available if course is available
        // This is a safety measure in case the trigger didn't fire for some reason.

        // Final Response
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
