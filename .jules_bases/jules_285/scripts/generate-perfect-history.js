
const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function generatePerfectHistory() {
    console.log('--- Iniciando Distribución Perfecta de Histórico (2 Años) ---');

    // 1. Fetch rentals
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=id,monto_total`, {
        headers: {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SERVICE_ROLE_KEY}`
        }
    });

    if (!response.ok) {
        console.error('Error fetching rentals:', await response.text());
        return;
    }

    const rentals = await response.json();
    const totalRecords = rentals.length;
    const TOTAL_DAYS = 730; // 2 years

    console.log(`Distribuyendo ${totalRecords} registros en ${TOTAL_DAYS} días...`);

    // 2. Create a "deck" of days
    let datePool = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - TOTAL_DAYS);

    for (let i = 0; i < totalRecords; i++) {
        // Distribute mathematically evenly
        const dayOffset = Math.floor((i / totalRecords) * TOTAL_DAYS);
        datePool.push(dayOffset);
    }

    // Shuffle the pool to randomise the order
    for (let i = datePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [datePool[i], datePool[j]] = [datePool[j], datePool[i]];
    }

    const pricePoints = [40, 60, 80, 120, 150];

    // 3. Update records
    for (let i = 0; i < totalRecords; i++) {
        const rental = rentals[i];

        // A. Pick a day from the pool
        const daysFromStart = datePool[i];
        const resDate = new Date(baseDate);
        resDate.setDate(resDate.getDate() + daysFromStart);

        // Set to Noon (12:00) strictly to avoid TZ jumping
        resDate.setHours(12, 0, 0, 0);

        const dateStr = resDate.toISOString().split('T')[0];

        // B. Working Hours (10:00 - 18:00) with variety
        const startHour = Math.floor(Math.random() * 9) + 10; // 10 to 18
        const startMin = Math.floor(Math.random() * 60);
        const hora_inicio = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:00`;

        // C. Invoice Date (Strictly DIFFERENT day: 1 to 5 days later)
        // This guarantees NO same-day invoices.
        const invDelay = Math.floor(Math.random() * 5) + 1; // 1, 2, 3, 4, or 5 days later
        const invDate = new Date(resDate);
        invDate.setDate(invDate.getDate() + invDelay);

        // Invoice time: business hours random
        const invHour = Math.floor(Math.random() * 9) + 9; // 9 to 17
        const invMin = Math.floor(Math.random() * 60);
        invDate.setHours(invHour, invMin, 0, 0);

        const fecha_pago = invDate.toISOString();

        // D. Price
        const monto_total = rental.monto_total && rental.monto_total > 0
            ? rental.monto_total
            : pricePoints[Math.floor(Math.random() * pricePoints.length)];

        const updates = {
            created_at: dateStr + 'T' + '09:00:00.000Z', // Created morning of reservation
            fecha_reserva: dateStr,
            hora_inicio: hora_inicio,
            fecha_pago: fecha_pago,
            monto_total: monto_total,
            estado_pago: 'pagado'
        };

        if (i % 50 === 0) console.log(`Progreso: ${i}/${totalRecords}...`);

        // Fire and forget
        await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?id=eq.${rental.id}`, {
            method: 'PATCH',
            headers: {
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(updates)
        });
    }

    console.log('--- Histórico Perfecto Completado ---');
}

generatePerfectHistory();
