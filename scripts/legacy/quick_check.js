const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
    const part = line.split('=');
    if (part.length >= 2) env[part[0].trim()] = part.slice(1).join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- DB Check ---');
    const { count: n } = await supabase.from('niveles_formacion').select('*', { count: 'exact', head: true });
    console.log('Niveles:', n);
    const { count: c } = await supabase.from('cursos').select('*', { count: 'exact', head: true });
    console.log('Cursos:', c);
    const { count: m } = await supabase.from('modulos').select('*', { count: 'exact', head: true });
    console.log('Modulos:', m);
    const { count: u } = await supabase.from('unidades_didacticas').select('*', { count: 'exact', head: true });
    console.log('Unidades:', u);
    const { count: e } = await supabase.from('evaluaciones').select('*', { count: 'exact', head: true });
    console.log('Evaluaciones:', e);
    const { count: q } = await supabase.from('preguntas').select('*', { count: 'exact', head: true });
    console.log('Preguntas:', q);
}

check();
