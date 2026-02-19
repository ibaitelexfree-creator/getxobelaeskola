
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value && !key.startsWith('#')) {
            envConfig[key] = value;
        }
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY; // Use service role key

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking evaluations and questions...');

    const { count: preguntasCount, error: preguntasError } = await supabase
        .from('preguntas')
        .select('*', { count: 'exact', head: true });

    if (preguntasError) {
        console.error('Error fetching preguntas:', preguntasError);
    } else {
        console.log(`Total preguntas: ${preguntasCount}`);
    }

    const { count: evaluacionesCount, error: evaluacionesError } = await supabase
        .from('evaluaciones')
        .select('*', { count: 'exact', head: true });

    if (evaluacionesError) {
        console.error('Error fetching evaluaciones:', evaluacionesError);
    } else {
        console.log(`Total evaluaciones: ${evaluacionesCount}`);
    }
}

checkTables();
