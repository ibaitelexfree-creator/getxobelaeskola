const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
    });
    return env;
}

async function run() {
    const env = getEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const email = 'jorge.test@gmail.com';
    const password = '123456';
    const nombre = 'Jorge';
    const apellidos = 'Test';

    console.log('Creating user:', email);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (authError) {
        if (authError.message.includes('already registered') || authError.code === 'email_exists') {
            console.log('User already exists, seeking ID...');
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                authData.user = existingUser;
            } else {
                console.error('Could not find existing user ID');
                return;
            }
        } else {
            console.error('Auth Error:', authError);
            return;
        }
    }

    const user = authData.user;
    console.log('User ID:', user.id);

    console.log('Creating/Updating profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: email,
            nombre: nombre,
            apellidos: apellidos,
            rol: 'alumno'
        });

    if (profileError) {
        console.error('Profile Error:', profileError);
    } else {
        console.log('Profile created successfully!');
    }
}

run();
