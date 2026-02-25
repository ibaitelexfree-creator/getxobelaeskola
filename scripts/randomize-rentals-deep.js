
/**
 * RE-RANDOMIZATION SCRIPT
 * Updates created_at, fecha_reserva AND hora_inicio to ensure visual variety.
 */

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function randomizeDates() {
    console.log('Fetching rentals...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=id`, {
        headers: { "apikey": SERVICE_ROLE_KEY, "Authorization": `Bearer ${SERVICE_ROLE_KEY}` }
    });
    const rentals = await response.json();
    console.log(`Found ${rentals.length} rentals. Randomizing everything...`);

    for (const rental of rentals) {
        // Random date between last 150 days
        const daysAgo = Math.floor(Math.random() * 150);
        const randomHour = Math.floor(Math.random() * 10) + 9; // 09:00 - 19:00
        const randomMin = Math.floor(Math.random() * 60);

        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(randomHour, randomMin, 0, 0);

        const created_at = date.toISOString();
        const fecha_reserva = created_at.split('T')[0];
        const hora_inicio = `${randomHour.toString().padStart(2, '0')}:${randomMin.toString().padStart(2, '0')}`;

        await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?id=eq.${rental.id}`, {
            method: 'PATCH',
            headers: {
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                created_at,
                fecha_reserva,
                hora_inicio
            })
        });
    }
    console.log('Finished deep randomization.');
}

randomizeDates();
