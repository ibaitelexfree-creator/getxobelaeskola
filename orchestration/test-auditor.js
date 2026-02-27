import axios from 'axios';

const ORCHESTRATOR_URL = 'http://localhost:3000/request';

async function testAuditor() {
    console.log('🧪 Iniciando Test del Auditor de Calidad...');

    try {
        console.log('\n--- [1] Prueba: Flujo Completo Exitoso ---');
        // Para esta prueba, asegúrate de que Architect devuelva un file_write o mock_exec válido
        // y el Builder lo ejecute. Dado que son stubs controlados (el Architect mock devuelve un mock_exec / verificación),
        // el Builder no creará archivos si el paso es check/mock, pero el manifest estará presente.
        // Vamos a forzar un prompt para generar un ciclo exitoso.

        const resp = await axios.post(ORCHESTRATOR_URL, { prompt: 'Validar sistema con auditor' });
        console.log('✅ Orquestador respondió status:', resp.data.status);
        console.log('✅ Score del Auditor:', resp.data.score);
        console.log('✅ Feedback:', resp.data.feedback);

    } catch (err) {
        if (err.response?.status === 406) {
            console.log('❌ Auditor rechazó el build. Estado 406.');
            console.log('   Score:', err.response.data.score);
            console.log('   Feedback:', err.response.data.feedback);
        } else {
            console.error('Error inesperado:', err.response?.data || err.message);
        }
    }

}

testAuditor();
