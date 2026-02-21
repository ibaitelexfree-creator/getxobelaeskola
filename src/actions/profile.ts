'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function togglePublicProfile(userId: string, isPublic: boolean) {
    const supabase = createClient();

    // Verify user is owner
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_public: isPublic })
        .eq('id', userId);

    if (error) {
        console.error('Error toggling public profile:', error);
        throw new Error('Failed to update profile visibility');
    }

    revalidatePath(`/academy/perfil/${userId}`);
    return { success: true };
}
