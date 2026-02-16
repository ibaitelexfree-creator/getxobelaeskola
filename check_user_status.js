
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

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env or .env.local');
    process.exit(1);
}

// Remove quotes if present
const cleanUrl = supabaseUrl.replace(/^["']|["']$/g, '');
const cleanKey = supabaseServiceKey.replace(/^["']|["']$/g, '');

const supabase = createClient(cleanUrl, cleanKey);

async function checkUser(email) {
    console.log(`Checking user with email: ${email}`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (user) {
        console.log('User found in auth.users:');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Confirmed At: ${user.confirmed_at}`);
        console.log(`Last Sign In: ${user.last_sign_in_at}`);
        console.log(`Created At: ${user.created_at}`);

        // Check profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.log('Error fetching profile:', profileError.message);
        } else {
            console.log('Profile found:', profile);
        }

    } else {
        console.log('User NOT found in auth.users.');
    }
}

// Get email from command line arg or default
const emailToCheck = process.argv[2] || 'andresserrano12343231@gmail.com';
checkUser(emailToCheck);
