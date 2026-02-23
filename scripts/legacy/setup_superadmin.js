const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    const email = 'Getxobelaeskola@gmail.com';
    const password = 'Jereministro1271!*';

    console.log('--- Setting up Admin User ---');

    // 1. Create or Update Auth User
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre: 'Admin', apellidos: 'Getxo Bela' }
    });

    if (authError) {
        if (authError.message.includes('already exists')) {
            console.log('User already exists in Auth, updating role in Profiles...');
            // If exists, find it and update
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const user = existingUsers.users.find(u => u.email === email);
            if (user) {
                await supabase.from('profiles').update({ rol: 'admin' }).eq('id', user.id);
                console.log('Role updated to admin for existing user.');
            }
        } else {
            console.error('Error creating auth user:', authError);
        }
    } else {
        console.log('Admin user created in Auth.');
        // 2. Update Profile to Admin
        await supabase.from('profiles').update({ rol: 'admin' }).eq('id', authUser.user.id);
        console.log('Role set to admin in Profiles.');
    }
}

run();
