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

    if (profile && ((profile as any).rol === 'admin' || (profile as any).rol === 'instructor')) {
        const { data: allCourses } = await supabaseAdmin
            .from('cursos')
            .select('id')
            .eq('activo', true);

        return ((allCourses || []) as any[]).map(c => c.id);
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

    return (data as any[]).map(row => row.curso_id).filter(Boolean);
}

/**
 * Helper to check if an entity is unlocked via progress using the recursive RPC.
 */
async function isEntityUnlocked(userId: string, type: 'niveles' | 'cursos' | 'modulos' | 'unidades', entityId: string): Promise<boolean> {
    console.log(`[isEntityUnlocked] Checking ${type} ${entityId} for user ${userId}`);
    const supabaseAdmin = createAdminClient();
    const { data: unlockStatus, error } = await supabaseAdmin.rpc('obtener_estado_desbloqueo_recursivo', {
        p_alumno_id: userId
    } as any);

    if (error) {
        console.error('[isEntityUnlocked] RPC Error:', error);
        return false;
    }

    if (!unlockStatus || !(unlockStatus as any)[type]) {
        console.warn(`[isEntityUnlocked] Missing unlock status for type ${type}`);
        return false;
    }

    const status = (unlockStatus as any)[type][entityId];
    console.log(`[isEntityUnlocked] Status for ${entityId}: ${status}`);

    // Any status other than 'bloqueado' or missing means it's accessible
    return !!status && status !== 'bloqueado' && status !== 'locked';
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

    if (profile && ((profile as any).rol === 'admin' || (profile as any).rol === 'instructor')) return true;

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
    const { data: enrollment } = await supabaseAdmin
        .from('inscripciones')
        .select('id')
        .eq('perfil_id', userId)
        .eq('curso_id', (course as any).id)
        .eq('estado_pago', 'pagado')
        .single();

    if (enrollment) return true;

    // 3. Fallback: Check progress-based unlock
    return await isEntityUnlocked(userId, 'cursos', (course as any).id);
}

/**
 * Verifies if a user has access to a specific module.
 * Access is granted if the user owns the parent Course OR if it's unlocked via progress.
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

    if (profile && ((profile as any).rol === 'admin' || (profile as any).rol === 'instructor')) return true;

    // 1. Check progress-based unlock (Fase 6 Primary Logic)
    if (await isEntityUnlocked(userId, 'modulos', moduleId)) return true;

    // 2. Fallback: Find the parent Course ID for this Module and check enrollment
    const { data: moduleData, error } = await supabaseAdmin
        .from('modulos')
        .select('curso_id')
        .eq('id', moduleId)
        .single();

    if (error || !moduleData || !(moduleData as any).curso_id) {
        return false;
    }

    const { data: enrollment } = await supabaseAdmin
        .from('inscripciones')
        .select('id')
        .eq('perfil_id', userId)
        .eq('curso_id', (moduleData as any).curso_id)
        .eq('estado_pago', 'pagado')
        .single();

    return !!enrollment;
}

/**
 * Verifies if a user has access to a specific unit.
 * Access is granted if the user owns the grandparent Course OR if it's unlocked via progress.
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

    if (profile && ((profile as any).rol === 'admin' || (profile as any).rol === 'instructor')) return true;

    // 1. Check progress-based unlock (Fase 6 Primary Logic)
    if (await isEntityUnlocked(userId, 'unidades', unitId)) return true;

    // 2. Fallback: Find the grandparent Course ID via the parent Module
    const { data: unitData, error } = await supabaseAdmin
        .from('unidades_didacticas')
        .select(`
            modulo:modulo_id (
                curso_id
            )
        `)
        .eq('id', unitId)
        .single();

    if (error || !unitData || !(unitData as any).modulo || !(unitData as any).modulo.curso_id) {
        return false;
    }

    const courseId = (unitData as any).modulo.curso_id;

    const { data: enrollment } = await supabaseAdmin
        .from('inscripciones')
        .select('id')
        .eq('perfil_id', userId)
        .eq('curso_id', courseId)
        .eq('estado_pago', 'pagado')
        .single();

    return !!enrollment;
}
