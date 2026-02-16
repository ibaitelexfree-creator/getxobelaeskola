
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env or .env.local manually
let envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), '.env');
}

if (!fs.existsSync(envPath)) {
    console.error('Error: Could not find .env or .env.local');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

// Remove quotes if present
const cleanUrl = supabaseUrl ? supabaseUrl.replace(/^["']|["']$/g, '') : '';
const cleanKey = supabaseServiceKey ? supabaseServiceKey.replace(/^["']|["']$/g, '') : '';

if (!cleanUrl || !cleanKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
}

const supabase = createClient(cleanUrl, cleanKey);

async function confirmUser(email) {
    console.log(`Confirming user with email: ${email}`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found.');
        return;
    }

    console.log(`User found: ${user.id}`);

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
    );

    if (updateError) {
        console.error('Error confirming user:', updateError);
    } else {
        console.log('User confirmed successfully:', data);
        console.log('Now you should be able to login.');
    }
}

const emailToConfirm = process.argv[2] || 'andresserrano12343231@gmail.com';
confirmUser(emailToConfirm);
