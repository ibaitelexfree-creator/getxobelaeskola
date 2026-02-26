const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
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

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

const FLEET_CONFIG = [
    { type: 'Optimist', count: 25, capacity: 1 },
    { type: 'Laser', count: 25, capacity: 1 },
    { type: 'Raquero', count: 1, capacity: 6 },
    { type: 'J80', count: 2, capacity: 5 },
    { type: 'Zodiac', count: 3, capacity: 8 },
    { type: 'Piragua (1 persona)', count: 10, capacity: 1 },
    { type: 'Piragua (2 personas)', count: 4, capacity: 2 },
    { type: 'Windsurf', count: 5, capacity: 1 },
    { type: 'Kayak (1 persona)', count: 10, capacity: 1 },
    { type: 'Kayak (2 personas)', count: 4, capacity: 2 }
];

async function seedFleet() {
    console.log('--- Seeding Fleet ---');
    for (const config of FLEET_CONFIG) {
        console.log(`Ensuring ${config.count} ${config.type}...`);
        const { count, error } = await supabase.from('embarcaciones').select('*', { count: 'exact', head: true }).eq('tipo', config.type);
        if (error) continue;
        const needed = config.count - (count || 0);
        if (needed > 0) {
            const newBoats = Array.from({ length: needed }).map((_, i) => ({
                nombre: `${config.type} ${(count || 0) + i + 1}`,
                tipo: config.type,
                capacidad: config.capacity,
                matricula: `MAT-${config.type.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
                estado: 'disponible'
            }));
            await supabase.from('embarcaciones').insert(newBoats);
        }
    }
}

async function updateProfiles() {
    console.log('--- Updating Profiles with Roles ---');
    const { data: profiles, error } = await supabase.from('profiles').select('id, rol');
    if (error) return console.error('Error fetching profiles:', error.message);

    const updates = [];
    const shuffled = profiles.sort(() => 0.5 - Math.random());
    const total = shuffled.length;

    shuffled.forEach((p, idx) => {
        if (p.rol === 'admin' || p.rol === 'instructor') return;
        let newRole = 'particular';
        const pct = idx / total;
        if (pct < 0.2) newRole = 'socio';
        else if (pct < 0.5) newRole = 'alumno';
        else if (pct < 0.6) newRole = 'alumno_agua';
        updates.push({ id: p.id, rol: newRole });
    });

    const rolesToUpdate = ['socio', 'alumno', 'alumno_agua', 'particular'];
    for (const role of rolesToUpdate) {
        const ids = updates.filter(u => u.rol === role).map(u => u.id);
        if (ids.length > 0) {
            console.log(`Updating ${ids.length} profiles to role ${role}...`);
            for (let i = 0; i < ids.length; i += 100) {
                await supabase.from('profiles').update({ rol: role }).in('id', ids.slice(i, i + 100));
            }
        }
    }
}

async function seedRentals() {
    console.log('--- Seeding Rentals (2 Years) ---');
    const { data: profiles } = await supabase.from('profiles').select('id');
    const { data: services } = await supabase.from('servicios_alquiler').select('id, precio_base');
    if (!profiles?.length || !services?.length) return;

    const rentals = [];
    const now = new Date();
    const startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 2);

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const month = d.getMonth();
        const isSummer = month >= 5 && month <= 8;
        const dailyCount = isSummer ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 4);
        for (let i = 0; i < dailyCount; i++) {
            if (Math.random() > 0.9) continue;
            const profile = profiles[Math.floor(Math.random() * profiles.length)];
            const service = services[Math.floor(Math.random() * services.length)];
            const hour = Math.floor(Math.random() * 9) + 9;
            rentals.push({
                perfil_id: profile.id,
                servicio_id: service.id,
                fecha_reserva: d.toISOString().split('T')[0],
                hora_inicio: `${hour}:00:00`,
                duracion_horas: Math.floor(Math.random() * 2) + 1,
                monto_total: service.precio_base,
                estado_pago: 'pagado',
                estado_entrega: 'completado'
            });
        }
    }
    for (let i = 0; i < rentals.length; i += 100) {
        await supabase.from('reservas_alquiler').insert(rentals.slice(i, i + 100));
        process.stdout.write('.');
    }
    console.log('\nRentals done.');
}

async function seedAcademy() {
    console.log('--- Seeding Academy ---');
    const { data: courses } = await supabase.from('cursos').select('id');
    const { data: profiles } = await supabase.from('profiles').select('id, rol').eq('rol', 'alumno');
    if (!courses?.length || !profiles?.length) return;

    for (const course of courses) {
        for (let i = 0; i < 4; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (i * 6));
            const { data: ed, error } = await supabase.from('ediciones_curso').insert({
                curso_id: course.id,
                fecha_inicio: date.toISOString().split('T')[0],
                fecha_fin: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                estado: 'finalizado',
                capacidad: 10,
                plazas_ocupadas: Math.floor(Math.random() * 8) + 2
            }).select().single();

            if (!error && ed) {
                const students = profiles.sort(() => 0.5 - Math.random()).slice(0, ed.plazas_ocupadas);
                await supabase.from('inscripciones').insert(students.map(s => ({
                    perfil_id: s.id,
                    curso_id: course.id,
                    edicion_id: ed.id,
                    estado_pago: 'pagado'
                })));
            }
        }
    }
    console.log('Academy seeded.');
}

async function run() {
    await seedFleet();
    await updateProfiles();
    // await seedRentals(); // Skipped to avoid duplicate massive data
    await seedAcademy();
    console.log('--- SEEDING COMPLETE ---');
}
run();
