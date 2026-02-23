import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface UserState {
    user: User | null;
    profile: any | null;
    loading: boolean;
    error: any | null;
    initialized: boolean;
    fetchUser: (force?: boolean) => Promise<void>;
    clearUser: () => void;
    setProfile: (profile: any) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
    initialized: false,
    fetchUser: async (force = false) => {
        // If already initialized and not forcing, skip
        if (get().initialized && !force) return;

        set({ loading: true, error: null });
        try {
            const supabase = createClient();

            // Get Auth User
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                // If it's a "no session" error, it's not really an error for the store, just no user
                set({ user: null, profile: null, initialized: true });
                return;
            }

            set({ user });

            if (user) {
                // Get Profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.warn('Error fetching profile in useUserStore:', profileError);
                }
                set({ profile });
            } else {
                set({ profile: null });
            }

            set({ initialized: true });
        } catch (error) {
            set({ error });
            console.error('Unexpected error in useUserStore:', error);
        } finally {
            set({ loading: false });
        }
    },
    clearUser: () => set({ user: null, profile: null, loading: false, initialized: true }),
    setProfile: (profile) => set({ profile })
}));
