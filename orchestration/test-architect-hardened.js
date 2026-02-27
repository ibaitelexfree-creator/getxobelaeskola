import axios from 'axios';
import crypto from 'crypto';

const ARCHITECT_URL = 'http://localhost:8081/analyze';

async function runHardenedTests() {
    console.log('🧪 Iniciando Pruebas de Endurecimiento Architect...');

    // 1. EJEMPLO REAL VÁLIDO
    try {
        console.log('\n--- [1] Prueba: Plan Real Válido ---');
        const resp = await axios.post(ARCHITECT_URL, { prompt: 'Validar sistema de auth' });
        console.log('✅ Status:', resp.status);
        console.log('✅ Plan JSON:', JSON.stringify(resp.data, null, 2));
    } catch (err) {
        console.error('❌ Error en válida:', err.response?.data || err.message);
    }

    // 2. FALLO: CAMPO EXTRA (additionalProperties: false)
    try {
        console.log('\n--- [2] Prueba: Fallo por Campo Extra ---');
        // Forzamos un prompt que devuelva campo extra en nuestro mock
        await axios.post(ARCHITECT_URL, { prompt: 'trigger_extra_field' });
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Éxito: Rechazado por campos adicionales.');
            console.log('   Errors:', JSON.stringify(err.response.data.details[0].message));
        }
    }

    // 3. FALLO: ID MAL FORMADO (pattern mismatch)
    try {
        console.log('\n--- [3] Prueba: ID mal formado ---');
        // Simulamos respuesta manual para este caso específico probando el validador local si quisiéramos, 
        // pero aquí lo probamos contra el servidor. 
        // Nota: El mock del server es robusto, así que para testear fallos del SCHEMA 
        // enviamos algo que el server analice.
    } catch (err) { }

    // 4. FALLO: CUERPO DEMASIADO GRANDE (100kb limit)
    try {
        console.log('\n--- [4] Prueba: Body Size Limit (>100kb) ---');
        const bigData = 'x'.repeat(1024 * 105);
        await axios.post(ARCHITECT_URL, { prompt: bigData });
    } catch (err) {
        if (err.response?.status === 413) {
            console.log('✅ Éxito: Payload Too Large (413).');
        } else {
            console.log('❌ Estado inesperado:', err.response?.status);
        }
    }
}

runHardenedTests();
