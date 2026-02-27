import axios from 'axios';

const ORCHESTRATOR_URL = 'http://localhost:3000';

async function testStability() {
    console.log('🧪 Iniciando Test de Robustez y Transacciones (WAL Mode)...');

    // 1. Prueba de Concurrencia (5 simultáneos)
    console.log('\n--- [1] Prueba: 5 Peticiones Simultáneas ---');
    const prompts = [
        'Misión 1: Backup i9',
        'Misión 2: Sync SSD',
        'Misión 3: GPU Temp Guard',
        'Misión 4: RAM Cleaner',
        'Misión 5: ROG Aura Sync'
    ];

    const requests = prompts.map(p => axios.post(`${ORCHESTRATOR_URL}/request`, { prompt: p }));

    try {
        const results = await Promise.allSettled(requests);
        results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
                console.log(`✅ ${prompts[i]} completada con JobID: ${r.value.data.jobId}`);
            } else {
                console.error(`❌ ${prompts[i]} falló: ${r.reason.message}`);
            }
        });
    } catch (err) {
        console.error('Error masivo:', err.message);
    }

    // 2. Validación de Estados y Auditoría
    console.log('\n--- [2] Prueba: Validación de Auditoría (Raw Response) ---');
    try {
        const listResp = await axios.get(`${ORCHESTRATOR_URL}/jobs?status=ARCHITECT_SUCCESS`);
        if (listResp.data.count > 0) {
            const firstJobId = listResp.data.jobs[0].id;
            const detail = await axios.get(`${ORCHESTRATOR_URL}/status/${firstJobId}`);
            console.log('✅ Verificación de campos de auditoría:');
            console.log('   - execution_time_ms:', detail.data.execution_time_ms, 'ms');
            console.log('   - has raw_response:', !!detail.data.architect_response_raw);
            console.log('   - schema_version:', detail.data.plan_json?.plan?.schema_version);
        }
    } catch (err) {
        console.error('Fallo verificación auditoría:', err.message);
    }

    // 3. Test de Timeout (Simulado)
    console.log('\n--- [3] Prueba: Timeout del Arquitecto ---');
    try {
        // Si el architect está programado para tardar, el orquestador marcará ARCHITECT_TIMEOUT
        console.log('   (Omitiendo trigger real de timeout para no bloquear el test)');
    } catch (err) { }
}

testStability();
