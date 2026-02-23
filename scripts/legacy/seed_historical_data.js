const { createClient } = require('@supabase/supabase-js');

async function seedData() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    console.log('--- Seeding historical rental data (Last 2 years) ---');

    // 1. Get existing profile and service to use as reference
    const { data: profiles } = await supabase.from('profiles').select('id').limit(5);
    const { data: services } = await supabase.from('servicios_alquiler').select('id, precio_base').limit(5);

    if (!profiles?.length || !services?.length) {
        console.error('Need at least one profile and one service to seed data.');
        return;
    }

    const fakeReservations = [];
    const now = new Date();

    // Generate ~100 random reservations distributed over the last 730 days
    for (let i = 0; i < 150; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 730);
        const date = new Date();
        date.setDate(now.getDate() - randomDaysAgo);

        const dateStr = date.toISOString().split('T')[0];
        const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];

        // Randomize price slightly around base
        const finalPrice = randomService.precio_base + (Math.floor(Math.random() * 21) - 10);

        fakeReservations.push({
            perfil_id: randomProfile.id,
            servicio_id: randomService.id,
            fecha_reserva: dateStr,
            hora_inicio: '10:00:00',
            duracion_horas: Math.floor(Math.random() * 3) + 1,
            monto_total: finalPrice,
            estado_pago: 'pagado',
            estado_entrega: 'completado',
            log_seguimiento: [{ status: 'pagado', note: 'Seed data generated', timestamp: date.toISOString() }]
        });
    }

    console.log(`Inserting ${fakeReservations.length} records...`);

    // Insert in batches of 50
    for (let i = 0; i < fakeReservations.length; i += 50) {
        const batch = fakeReservations.slice(i, i + 50);
        const { error } = await supabase.from('reservas_alquiler').insert(batch);
        if (error) {
            console.error('Error inserting batch:', error);
        } else {
            console.log(`Batch ${i / 50 + 1} inserted.`);
        }
    }

    console.log('Seeding completed successfully.');
}

seedData();
