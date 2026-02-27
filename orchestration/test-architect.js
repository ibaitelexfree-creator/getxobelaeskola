import axios from 'axios';

const ARCHITECT_URL = 'http://localhost:8081/analyze';

async function runTests() {
    console.log('🧪 Iniciando pruebas de mcp-architect.js...');

    // 1. Prueba: Request Válida
    try {
        console.log('\n--- [1] Prueba: Prompt Válido ---');
        const resp = await axios.post(ARCHITECT_URL, { prompt: 'Crear flujo de sincronización' });
        console.log('✅ Status:', resp.status);
        console.log('✅ Plan ID:', resp.data.plan.id);
    } catch (err) {
        console.error('❌ Fallo en prueba válida:', err.response?.data || err.message);
    }

    // 2. Prueba: Texto Polluted (debe dar 400)
    try {
        console.log('\n--- [2] Prueba: Texto Extra (Polluted) ---');
        const resp = await axios.post(ARCHITECT_URL, { prompt: 'trigger_pollute' });
        console.log('❌ Debería haber fallado pero respondió:', resp.status);
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Éxito: Servidor rechazó texto extra con 400.');
            console.log('   Error message:', err.response.data.error);
        } else {
            console.error('❌ Fallo inesperado:', err.response?.status || err.message);
        }
    }

    // 3. Prueba: Prompt Vacío (debe dar 400)
    try {
        console.log('\n--- [3] Prueba: Prompt Vacío ---');
        await axios.post(ARCHITECT_URL, {});
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Éxito: Servidor rechazó prompt vacío.');
        } else {
            console.error('❌ Fallo inesperado:', err.response?.status || err.message);
        }
    }
}

runTests();
