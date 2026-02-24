const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to read .env.local
function getEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim();
    });
    return env;
}

const env = getEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function apiRequest(table, method, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
        const options = {
            method: method,
            hostname: url.hostname,
            path: url.pathname,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        console.log('--- SEEDING PHASE 2: EVALUATIONS ---');

        // 1. Get Course ID
        const cursos = await apiRequest('cursos?slug=eq.iniciacion-vela-ligera', 'GET');
        if (cursos.length === 0) throw new Error('Course not found');
        const cursoId = cursos[0].id;
        console.log(`Found Course: ${cursoId}`);

        // 2. Get Modules
        const modulos = await apiRequest(`modulos?curso_id=eq.${cursoId}`, 'GET');
        console.log(`Found ${modulos.length} modules`);

        // 3. Get Units
        const moduloIds = modulos.map(m => m.id);
        const units = await apiRequest(`unidades_didacticas?modulo_id=in.(${moduloIds.join(',')})`, 'GET');
        console.log(`Found ${units.length} units`);

        // 4. Create Quizzes
        console.log('Creating Quizzes...');
        for (const unit of units) {
            await apiRequest('evaluaciones', 'POST', {
                tipo: 'quiz_unidad',
                entidad_tipo: 'unidad',
                entidad_id: unit.id,
                titulo_es: `Quiz: ${unit.nombre_es}`,
                titulo_eu: `Quiz: ${unit.nombre_eu}`,
                num_preguntas: 5,
                nota_aprobado: 60,
                cooldown_minutos: 2
            }).catch(e => console.log(`Skip/Error unit ${unit.slug}: ${e.message}`));
        }

        // 5. Create Module Exams
        console.log('Creating Module Exams...');
        for (const mod of modulos) {
            await apiRequest('evaluaciones', 'POST', {
                tipo: 'examen_modulo',
                entidad_tipo: 'modulo',
                entidad_id: mod.id,
                titulo_es: `Examen: ${mod.nombre_es}`,
                titulo_eu: `Azterketa: ${mod.nombre_eu}`,
                num_preguntas: 15,
                tiempo_limite_min: 20,
                nota_aprobado: 70,
                intentos_ventana_limite: 3,
                intentos_ventana_horas: 24
            }).catch(e => console.log(`Skip/Error mod ${mod.slug}: ${e.message}`));
        }

        // 6. Create Final Exam
        console.log('Creating Final Exam...');
        await apiRequest('evaluaciones', 'POST', {
            tipo: 'examen_final',
            entidad_tipo: 'curso',
            entidad_id: cursoId,
            titulo_es: `Examen Final: Iniciación a la Vela Ligera`,
            titulo_eu: `Ikastaro-Amaierako Azterketa: Bela Arinaren Hasiera`,
            num_preguntas: 30,
            tiempo_limite_min: 45,
            nota_aprobado: 75,
            intentos_ventana_limite: 2,
            intentos_ventana_horas: 48
        }).catch(e => console.log(`Skip/Error final exam: ${e.message}`));

        // 7. Practical Activities
        console.log('Creating Activities...');
        const activities = [
            { slug: 'seguridad-en-el-mar', title: 'Viento creciente en través', tipo: 'escenario_emergencia' },
            { slug: 'la-trasluchada', title: 'Trasluchada involuntaria', tipo: 'simulacion_maniobra' },
            { slug: 'la-virada-por-avante', title: 'Virada fallida: en proa', tipo: 'simulacion_maniobra' },
            { slug: 'preparacion-aparejado', title: 'Olvidaste el tapón', tipo: 'escenario_emergencia' },
            { slug: 'reglas-navegacion-basicas', title: 'Cruce con otro velero', tipo: 'decision_tactica' },
            { slug: 'seguridad-en-el-mar', title: 'Vuelco (ozobra)', tipo: 'escenario_emergencia' },
            { slug: 'reglas-navegacion-basicas', title: 'Zona de bañistas', tipo: 'decision_tactica' },
            { slug: 'tu-primera-navegacion', title: 'Pérdida de gobierno', tipo: 'escenario_emergencia' },
            { slug: 'los-rumbos-respecto-al-viento', title: 'Cambio brusco de viento', tipo: 'decision_tactica' },
            { slug: 'reglas-navegacion-basicas', title: 'Compañero en apuros', tipo: 'escenario_emergencia' }
        ];

        for (const act of activities) {
            const unit = units.find(u => u.slug === act.slug);
            if (unit) {
                await apiRequest('actividades', 'POST', {
                    unidad_id: unit.id,
                    tipo: act.tipo,
                    titulo_es: act.title,
                    titulo_eu: act.title, // Simplified for seed
                    config_json: { scenario: act.title }
                }).catch(e => console.log(`Skip/Error activity ${act.title}: ${e.message}`));
            }
        }

        console.log('--- SEEDING PHASE 2 COMPLETE ---');
    } catch (err) {
        console.error('FAILED:', err);
    }
}

run();
