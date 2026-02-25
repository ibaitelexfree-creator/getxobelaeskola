const { createClient } = require('@supabase/supabase-js');

// Configuración Hardcoded para ir rápido
const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function seedLastMonth() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Seeding Data for the Last Month ---');

    // 1. Get resources
    const { data: profiles } = await supabase.from('profiles').select('id').limit(10);
    const { data: services } = await supabase.from('servicios_alquiler').select('id, precio_base').limit(5);

    if (!profiles?.length || !services?.length) {
        console.error('Need profiles and services to seed.');
        return;
    }

    const fakeReservations = [];
    const now = new Date(); // 2026-02-13 based on user context

    // 2. Loop for the last 30 days
    for (let i = 0; i < 30; i++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - i);
        const dateStr = targetDate.toISOString().split('T')[0];

        // 3. Generate random number of transactions per day (e.g., 3 to 8)
        const dailyCount = Math.floor(Math.random() * 6) + 3;

        for (let j = 0; j < dailyCount; j++) {
            const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
            const randomService = services[Math.floor(Math.random() * services.length)];

            // Randomize price slightly
            const finalPrice = randomService.precio_base + (Math.floor(Math.random() * 10) - 5);

            // Generate specific timestamp for this day (9 AM to 7 PM)
            const hour = 9 + Math.floor(Math.random() * 10);
            const minute = Math.floor(Math.random() * 60);
            const timestamp = new Date(targetDate);
            timestamp.setHours(hour, minute, 0, 0);
            const isoTimestamp = timestamp.toISOString();

            fakeReservations.push({
                perfil_id: randomProfile.id,
                servicio_id: randomService.id,
                fecha_reserva: dateStr,
                hora_inicio: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
                duracion_horas: 2,
                monto_total: finalPrice,
                estado_pago: 'pagado',
                estado_entrega: 'completado',
                created_at: isoTimestamp, // Crucial for sorting
                fecha_pago: isoTimestamp, // Crucial for reporting
                log_seguimiento: [{ status: 'pagado', note: 'Last month seed', timestamp: isoTimestamp }]
            });
        }
    }

    console.log(`Inserting ${fakeReservations.length} new records for the last month...`);

    // 4. Insert in batches
    for (let i = 0; i < fakeReservations.length; i += 50) {
        const batch = fakeReservations.slice(i, i + 50);
        const { error } = await supabase.from('reservas_alquiler').insert(batch);
        if (error) {
            console.error('Error inserting batch:', error);
        } else {
            console.log(`Inserted batch ${i / 50 + 1}`);
        }
    }

    console.log('--- Seed Complete ---');
}

seedLastMonth();
