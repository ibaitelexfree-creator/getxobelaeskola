import { createBrowserClient } from '@supabase/ssr'

let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    // MOCK PARA AUDITORÍA VISUAL - Client Side
    const mockUser = { id: '00000000-0000-0000-0000-000000000000', email: 'auditor@getxobelaeskola.com' };

    return {
        auth: {
            getUser: async () => ({ data: { user: mockUser }, error: null }),
            getSession: async () => ({ data: { session: { user: mockUser } }, error: null }),
            onAuthStateChange: (callback: any) => {
                // Simular evento de signed in
                callback('SIGNED_IN', { user: mockUser });
                return { data: { subscription: { unsubscribe: () => { } } } };
            }
        },
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: { rol: 'admin', nombre: 'Audit Mode' }, error: null }),
                    order: () => ({ limit: () => ({ single: async () => ({ data: null, error: null }) }) })
                }),
                order: () => ({ limit: () => ({ single: async () => ({ data: null, error: null }) }) })
            }),
            insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
            update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) })
        })
    } as any;
}
