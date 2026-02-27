import axios from 'axios';

const ORCHESTRATOR_URL = 'http://localhost:3000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runMission(id) {
    console.log(`\n=== 🚀 Misión Canary ${id} ===`);
    try {
        const reqStart = Date.now();
        const resData = await axios.post(`${ORCHESTRATOR_URL}/request`, {
            prompt: `Misión de prueba canary ${id} - Imprime OK`
        });
        const jobId = resData.data.jobId;
        console.log(`✅ Pipeline Finalizado (${Date.now() - reqStart}ms) | JobId: ${jobId} | Status: ${resData.data.status}`);

        if (resData.data.status !== 'READY_FOR_EXECUTION') {
            console.log(`⚠️ Pipeline no llegó a READY_FOR_EXECUTION. Status: ${resData.data.status}`);
            return;
        }

        const execStart = Date.now();
        console.log(`⏳ Disparando a Gateway (n8n reales)...`);
        const execRes = await axios.post(`${ORCHESTRATOR_URL}/execute/${jobId}`);

        console.log(`✅ Gateway Aceptó (${Date.now() - execStart}ms)`);
        console.log(`   🔸 Signature Hash: ${execRes.data.signature}`);
        console.log(`   🔸 Status Status: ${execRes.status}`);

    } catch (error) {
        if (error.response) {
            console.error(`❌ Error en Misión ${id} [HTTP ${error.response.status}]:`, error.response.data);
        } else {
            console.error(`❌ Error de Conexión en Misión ${id}:`, error.message);
        }
    }
}

async function main() {
    console.log("🦅 Iniciando Secuencia Canary Ampliada (50%)...\n");

    // Disparamos 10 misiones
    for (let i = 1; i <= 10; i++) {
        await runMission(i);
        console.log("\n⏱️ Esperando 3 segundos...");
        await sleep(3000);
    }

    console.log("\n🏁 Secuencia Canary Finalizada.");
}

main();
