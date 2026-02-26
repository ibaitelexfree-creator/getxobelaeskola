import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
<<<<<<< HEAD
        const auth = await requireAdmin();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;
=======
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;
>>>>>>> pr-286

        const { email, nombre, apellidos, telefono } = await request.json();

        // 2. Invite or Get Existing User
        let userId: string;
        const requestedEmail = email.trim().toLowerCase();

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            requestedEmail,
            { data: { nombre, apellidos } }
        );

        if (inviteError) {
            // Check if user already exists (GoTrue error for already registered is often 422 or specific message)
            if (inviteError.status === 422 || inviteError.message.toLowerCase().includes('already') || inviteError.message.toLowerCase().includes('registered')) {
                const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (listError) throw listError;

<<<<<<< HEAD
                const existing = users.find((u) => u.email?.toLowerCase() === requestedEmail);
=======
                const existing = users.find(u => u.email?.toLowerCase() === requestedEmail);
>>>>>>> pr-286
                if (!existing) {
                    throw new Error(`El usuario ${requestedEmail} parece existir pero no pudimos encontrar su registro. Contacte con soporte.`);
                }
                userId = existing.id;
            } else {
                throw inviteError;
            }
        } else {
            userId = inviteData.user.id;
        }

        // 3. Ensure the profile exists with 'instructor' role (UPSERT)
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: userId,
            rol: 'instructor',
            nombre,
            apellidos,
            email: requestedEmail,
            telefono
        }, {
            onConflict: 'id'
        });

        if (profileError) {
            console.error('Profile upsert error:', profileError);
            throw profileError;
        }

<<<<<<< HEAD
=======
        if (profileError) throw profileError;

>>>>>>> pr-286
        return NextResponse.json({ success: true, message: 'Instructor creado correctamente' });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('STAFF CREATION ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
