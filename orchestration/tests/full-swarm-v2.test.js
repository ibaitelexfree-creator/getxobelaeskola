import SwarmOrchestratorV2 from '../lib/swarm-orchestrator-v2.js';
import pg from '../lib/pg-client.js';

async function testFullSwarm() {
    console.log('🚀 Iniciando Test de Swarm CI/CD 2.0 (Fase 03)...');

    const task = "Crea un sistema de registro de usuarios con validación de email y perfil de usuario (nombre, avatar y bio).";

    try {
        const result = await SwarmOrchestratorV2.executeSequential(task, { name: 'UserRegistryFeature' });

        console.log('\n--- RESULTADOS DEL SWARM ---');
        console.log('ID:', result.swarmId);
        console.log('Status:', result.status);

        console.log('\n[Architect]');
        console.log('Vote:', result.outputs.architect.vote);
        console.log('Confidence:', result.outputs.architect.confidence);

        console.log('\n[Data Master]');
        console.log('Vote:', result.outputs.data.vote);
        console.log('Confidence:', result.outputs.data.confidence);

        console.log('\n[UI Engine]');
        console.log('Vote:', result.outputs.ui.vote);
        console.log('Confidence:', result.outputs.ui.confidence);

        // Verificar en Postgres
        const swarmRow = await pg.query('SELECT status FROM sw2_swarms WHERE id = $1', [result.swarmId]);
        console.log('\n✅ Verificación DB (Swarm):', swarmRow.rows[0].status);

        const taskRows = await pg.query('SELECT agent_role, status FROM sw2_tasks WHERE swarm_id = $1', [result.swarmId]);
        console.log('✅ Verificación DB (Tareas):', taskRows.rowCount);
        taskRows.rows.forEach(r => console.log(` - ${r.agent_role}: ${r.status}`));

        console.log('\n✨ Fase 03 verificada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test Swarm Fallido:', error.message);
        process.exit(1);
    }
}

testFullSwarm();
