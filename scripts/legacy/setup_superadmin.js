const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
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
