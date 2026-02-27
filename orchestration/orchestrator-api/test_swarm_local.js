import 'dotenv/config';
import { startSwarmV2 } from './src/lib/swarm-orchestrator-v2.js';

async function testSwarm() {
    console.log("Starting deliberate error swarm test...");
    try {
        await startSwarmV2('Crear sistema de comentarios usando una tabla llamada comments que ya existe y con una columna duplicada.', 'Validation Swarm (Deliberate Error)');
        console.log("Done");
    } catch (e) {
        console.error("Test Error:", e);
    }
}

testSwarm();
