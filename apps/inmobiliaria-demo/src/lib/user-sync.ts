
import sql from '@/lib/db';

export async function syncUser(supabaseUser: any) {
    if (!supabaseUser) return null;

    const { id, email, user_metadata } = supabaseUser;
    const name = user_metadata?.full_name || user_metadata?.name || email.split('@')[0];

    try {
        // Upsert user into Neon database
        // We set role to 'user' by default if it doesn't exist
        const [user] = await sql`
            INSERT INTO users (id, email, name, role)
            VALUES (${id}, ${email}, ${name}, 'user')
            ON CONFLICT (id) DO UPDATE 
            SET email = EXCLUDED.email, name = EXCLUDED.name
            RETURNING *
        `;
        return user;
    } catch (error) {
        console.error('Error syncing user to Neon:', error);
        return null;
    }
}

export async function getUserRole(userId: string) {
    try {
        const [user] = await sql`SELECT role FROM users WHERE id = ${userId}`;
        return user?.role || 'user';
    } catch (error) {
        console.error('Error getting user role:', error);
        return 'user';
    }
}
