import axios from 'axios';

async function runTest() {
    console.log("🚀 Iniciando Test de Stress del Gateway Simulado (10 Misiones)");

    for (let i = 1; i <= 10; i++) {
        console.log(`\n=== Misión ${i}/10 ===`);
        try {
            // 1. Solicitud de creación (pasa por Architect, Builder, Auditor)
            const reqStart = Date.now();
            const resData = await axios.post('http://localhost:3000/request', {
                prompt: `Genera un script de python en test_${i}.py que imprima Hola`
            });
            const jobId = resData.data.jobId;
            console.log(`✅ Pipeline Finalizado (${Date.now() - reqStart}ms) | JobId: ${jobId} | Status: ${resData.data.status}`);

            if (resData.data.status !== 'READY_FOR_EXECUTION') {
                console.log(`⚠️ Pipeline no llegó a READY_FOR_EXECUTION. Status: ${resData.data.status}`);
                continue;
            }

            // 2. Disparar Gateway
            const execStart = Date.now();
            const execRes = await axios.post(`http://localhost:3000/execute/${jobId}`);

            console.log(`✅ Gateway Disparado (${Date.now() - execStart}ms)`);
            console.log(`   🔸 Signature Hash: ${execRes.data.signature}`);
            console.log(`   🔸 Gateway Response:`, execRes.data.gateway_response);

        } catch (error) {
            console.error(`❌ Error en Misión ${i}:`);
            console.error(error.response?.data || error.message);
        }
    }
    console.log("\n🏁 Batería de pruebas finalizada.");
}

runTest();
