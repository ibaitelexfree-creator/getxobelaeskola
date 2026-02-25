
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '.env');
const envConfig = require('dotenv').config({ path: envPath });

if (envConfig.error) {
    console.error("Error loading .env file:", envConfig.error);
    process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking for 'habilidades' table...");
    const { data: habilidades, error: err1 } = await supabase
        .from('habilidades')
        .select('count', { count: 'exact', head: true });

    if (err1) {
        console.log("'habilidades' table error:", err1.message);
    } else {
        console.log("'habilidades' table exists. Count:", habilidades);
    }

    console.log("Checking for 'skills' table...");
    const { data: skills, error: err2 } = await supabase
        .from('skills')
        .select('count', { count: 'exact', head: true });

    if (err2) {
        console.log("'skills' table error:", err2.message);
    } else {
        console.log("'skills' table exists. Count:", skills);
    }

    console.log("Checking for functions...");
    const { data: functions, error: err3 } = await supabase
        .rpc('evaluar_habilidades', { p_alumno_id: '00000000-0000-0000-0000-000000000000' });
    // This will likely fail with invalid input syntax for uuid if function exists but I pass dummy, 
    // or just return empty. If function doesn't exist, it will say function not found.

    if (err3) {
        console.log("Function 'evaluar_habilidades' check result:", err3.message);
    } else {
        console.log("Function 'evaluar_habilidades' seems to exist (or at least callable).");
    }

    const { data: func2, error: err4 } = await supabase
        .rpc('check_and_unlock_skills');

    if (err4) {
        console.log("Function 'check_and_unlock_skills' check result:", err4.message);
    } else {
        console.log("Function 'check_and_unlock_skills' seems to exist.");
    }
}

checkSchema();
