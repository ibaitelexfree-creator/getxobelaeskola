const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectCertificados() {
    console.log('Inspecting "certificados" table...');
    const { data, error } = await supabase.from('certificados').select('*').limit(1);
    if (error) {
        console.error('Error selecting from certificados:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('Table exists but is empty. Trying to guess columns by selecting them individually...');
        const possibleColumns = ['id', 'user_id', 'perfil_id', 'student_id', 'course_id', 'curso_id', 'issue_date', 'fecha_emision', 'certificate_number', 'numero_certificado', 'hash', 'verificacion_hash', 'created_at'];
        for (const col of possibleColumns) {
            const { error: colError } = await supabase.from('certificados').select(col).limit(1);
            if (!colError) {
                console.log(`✅ Column "${col}" exists.`);
            }
        }
    }
}

inspectCertificados();
