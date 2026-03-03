// This file no longer uses 'use server' to allow static export for Capacitor.
// It now calls an API route instead.
import { createClient } from '@/lib/supabase/client';

export async function togglePublicProfile(userId: string, isPublic: boolean) {
    try {
        const res = await fetch('/api/user/settings/visibility', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_public: isPublic }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to update visibility');
        }

        return await res.json();
    } catch (error) {
        console.error('Error toggling public profile:', error);
        throw error;
    }
}
