
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function seed() {
    console.log('Reading .env.local...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('Fetching courses, instructors and boats...');
    const [{ data: courses }, { data: staff }, { data: boats }] = await Promise.all([
        supabase.from('cursos').select('id, nombre_es'),
        supabase.from('profiles').select('id, nombre, rol').in('rol', ['admin', 'instructor']),
        supabase.from('embarcaciones').select('id, nombre')
    ]);

    if (!courses?.length || !staff?.length) {
        console.error('Error: Courses or Staff not found');
        return;
    }

    console.log(`Found ${courses.length} courses, ${staff.length} staff, ${boats?.length || 0} boats.`);

    // Check table existence
    const { error: checkError } = await supabase.from('sesiones').select('id').limit(1);
    if (checkError && (checkError.code === 'PGRST205' || checkError.code === 'PGRST204' || checkError.code === '42P01')) {
        console.error('❌ Table "public.sesiones" not found. Please run migrations first.');
        return;
    }

    const sessions = [];
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

    for (let i = 0; i < 150; i++) {
        const isWeekend = Math.random() > 0.4;
        let randomTime;
        do {
            randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
            const d = new Date(randomTime);
            if (isWeekend && (d.getDay() === 0 || d.getDay() === 6)) break;
            if (!isWeekend && (d.getDay() > 0 && d.getDay() < 6)) break;
        } while (true);

        const startDate = new Date(randomTime);
        startDate.setMinutes(0, 0, 0);
        startDate.setHours([10, 12, 16][Math.floor(Math.random() * 3)]);

        const endDate = new Date(startDate.getTime() + (2 + Math.floor(Math.random() * 3)) * 3600000);

        const course = courses[Math.floor(Math.random() * courses.length)];
        const instructor = staff[Math.floor(Math.random() * staff.length)];
        const boat = boats?.length ? boats[Math.floor(Math.random() * boats.length)] : null;

        let estado = 'realizada';
        if (startDate > now) estado = 'programada';
        else if (Math.random() < 0.05) estado = 'cancelada';

        const obsMap = {
            'realizada': ['Buen viento, progresando.', 'Práctica de viradas.', 'Sesión teórica y práctica.', 'Maniobras de puerto.', 'Meteorología perfecta.'],
            'cancelada': ['Temporal.', 'Sin viento.', 'Avería motor.'],
            'programada': ['Pendiente de previsión.', 'Alta motivación.']
        };
        const observaciones = (obsMap[estado] || ['Ok'])[Math.floor(Math.random() * (obsMap[estado]?.length || 1))];

        sessions.push({
            curso_id: course.id,
            instructor_id: instructor.id,
            embarcacion_id: boat?.id || null,
            fecha_inicio: startDate.toISOString(),
            fecha_fin: endDate.toISOString(),
            estado: estado,
            observaciones: observaciones,
            created_at: startDate.toISOString()
        });
    }

    console.log(`Inserting ${sessions.length} sessions...`);
    let count = 0;
    for (let j = 0; j < sessions.length; j += 20) {
        const batch = sessions.slice(j, j + 20);
        const { error } = await supabase.from('sesiones').insert(batch);
        if (error) console.error('Batch error:', error.code, error.message);
        else count += batch.length;
    }
    console.log(`✅ Seeded ${count} sessions.`);
}

seed();
