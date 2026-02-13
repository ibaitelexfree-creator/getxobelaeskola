import { createAdminClient } from '@/lib/supabase/admin';
import 'server-only';

/**
 * Returns a list of course IDs that the user has successfully purchased.
 * 
 * @param userId - The user's profile ID (UUID).
 * @returns Array of course IDs (UUIDs).
 */
export async function getUserEnrollments(userId: string): Promise<string[]> {
    if (!userId) return [];

    const supabaseAdmin = createAdminClient();

    // 0. Staff/Admin Bypass: Get all courses
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('rol')
        .eq('id', userId)
        .single();

    if (profile?.rol === 'admin' || profile?.rol === 'instructor') {
        const { data: allCourses } = await supabaseAdmin
            .from('cursos')
            .select('id')
            .eq('activo', true);

        return (allCourses || []).map(c => c.id);
    }

    // 1. Regular User: Only fetch valid, paid enrollments
    const { data, error } = await supabaseAdmin
        .from('inscripciones')
        .select('curso_id')
        .eq('perfil_id', userId)
        .eq('estado_pago', 'pagado');

    if (error || !data) {
        console.error('Error fetching enrollments:', error);
        return [];
    }

    return data.map(row => row.curso_id).filter(Boolean);
}

/**
 * Verifies if a user has access to a specific course by its slug.
 * 
 * @param userId - The user's profile ID.
 * @param courseSlug - The unique slug of the course.
 * @returns boolean - true if access is granted.
 */
export async function verifyCourseAccess(userId: string, courseSlug: string): Promise<boolean> {
    if (!userId || !courseSlug) return false;

    const supabaseAdmin = createAdminClient();

    // 0. Staff/Admin Bypass
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('rol')
        .eq('id', userId)
        .single();

    if (profile?.rol === 'admin' || profile?.rol === 'instructor') return true;

    // 1. Resolve Course ID from Slug
    const { data: course, error } = await supabaseAdmin
        .from('cursos')
        .select('id')
        .eq('slug', courseSlug)
        .single();

    if (error || !course) {
        return false;
    }

    // 2. Check if this ID is in the user's enrollments
    const { data: enrollment, error: enrollError } = await supabaseAdmin
        .from('inscripciones')
        .select('id')
        .eq('perfil_id', userId)
        .eq('curso_id', course.id)
        .eq('estado_pago', 'pagado')
        .single();

    if (enrollError || !enrollment) {
        return false;
    }

    return true;
}

/**
 * Verifies if a user has access to a specific module.
 * Access is granted if the user owns the parent Course.
 * 
 * @param userId - The user's profile ID.
 * @param moduleId - The UUID of the module.
 * @returns boolean - true if access is granted.
 */
export async function verifyModuleAccess(userId: string, moduleId: string): Promise<boolean> {
    if (!userId || !moduleId) return false;

    const supabaseAdmin = createAdminClient();

    // 0. Staff/Admin Bypass
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('rol')
        .eq('id', userId)
        .single();

    if (profile?.rol === 'admin' || profile?.rol === 'instructor') return true;

    // 1. Find the parent Course ID for this Module
    const { data: moduleData, error } = await supabaseAdmin
        .from('modulos')
        .select('curso_id')
        .eq('id', moduleId)
        .single();

    if (error || !moduleData || !moduleData.curso_id) {
        return false;
    }

    // 2. Verify enrollment in the parent Course
    const { data: enrollment } = await supabaseAdmin
        .from('inscripciones')
        .select('id')
        .eq('perfil_id', userId)
        .eq('curso_id', moduleData.curso_id)
        .eq('estado_pago', 'pagado')
        .single();

    return !!enrollment;
}

/**
 * Verifies if a user has access to a specific unit.
 * Access is granted if the user owns the grandparent Course.
 * 
 * @param userId - The user's profile ID.
 * @param unitId - The UUID of the unit.
 * @returns boolean - true if access is granted.
 */
export async function verifyUnitAccess(userId: string, unitId: string): Promise<boolean> {
    if (!userId || !unitId) return false;

    const supabaseAdmin = createAdminClient();

    // 0. Staff/Admin Bypass
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('rol')
        .eq('id', userId)
        .single();

    if (profile?.rol === 'admin' || profile?.rol === 'instructor') return true;

    // 1. Find the grandparent Course ID via the parent Module
    // Join: unidades -> modulos -> curso_id
    const { data: unitData, error } = await supabaseAdmin
        .from('unidades_didacticas')
        .select(`
            modulo:modulo_id (
                curso_id
            )
        `)
        .eq('id', unitId)
        .single();

    if (error || !unitData || !unitData.modulo || !(unitData.modulo as any).curso_id) {
        return false;
    }

    const courseId = (unitData.modulo as any).curso_id;

    // 2. Verify enrollment in the grandparent Course
    const { data: enrollment } = await supabaseAdmin
        .from('inscripciones')
        .select('id')
        .eq('perfil_id', userId)
        .eq('curso_id', courseId)
        .eq('estado_pago', 'pagado')
        .single();

    return !!enrollment;
}
