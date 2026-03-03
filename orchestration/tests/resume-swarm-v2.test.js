import SwarmOrchestratorV2 from '../lib/swarm-orchestrator-v2.js';
import pg from '../lib/pg-client.js';
import crypto from 'crypto';

async function testResumeSwarm() {
    console.log('🚀 Iniciando Test de Reanudación de Swarm (resumeSwarm)...');

    const swarmId = crypto.randomUUID();
    const taskDescription = "Tarea de prueba para reanudación: Crear un endpoint de salud.";
    const metadata = { taskDescription, name: 'ResumeTest' };

    try {
        // 1. Preparar el escenario: Insertar un swarm bloqueado/parcial
        console.log(`[Test] Insertando swarm ${swarmId} y tarea previa...`);
        await pg.query(
            'INSERT INTO sw2_swarms (id, name, status, metadata) VALUES ($1, $2, $3, $4)',
            [swarmId, 'ResumeTest', 'BLOCKED', JSON.stringify(metadata)]
        );

        // Insertar tarea ARCHITECT ya completada
        const architectOutput = {
            vote: 'OK',
            confidence: 0.95,
            design: "Health check endpoint returning 200 OK"
        };
        await pg.query(
            'INSERT INTO sw2_tasks (swarm_id, agent_role, status, response_payload, completed_at) VALUES ($1, $2, $3, $4, NOW())',
            [swarmId, 'architect', 'SUCCESS', JSON.stringify(architectOutput)]
        );

        // 2. Ejecutar reanudación
        console.log('[Test] Llamando a resumeSwarm...');
        const result = await SwarmOrchestratorV2.resumeSwarm(swarmId);

        console.log('\n--- RESULTADOS DE REANUDACIÓN ---');
        console.log('ID:', result.swarmId);
        console.log('Status:', result.status);

        // 3. Verificaciones
        const taskRows = await pg.query('SELECT agent_role, status FROM sw2_tasks WHERE swarm_id = $1 ORDER BY completed_at ASC', [swarmId]);
        console.log('\n✅ Tareas en DB para el swarm:');
        taskRows.rows.forEach(r => console.log(` - ${r.agent_role}: ${r.status}`));

        // Verificar que ARCHITECT fue la que ya teníamos y que se crearon las demás
        const roles = taskRows.rows.map(r => r.agent_role);
        if (!roles.includes('architect') || !roles.includes('data') || !roles.includes('ui')) {
             throw new Error("No se encontraron todas las fases esperadas en la DB");
        }

        const swarmRow = await pg.query('SELECT status, completed_at FROM sw2_swarms WHERE id = $1', [swarmId]);
        console.log('\n✅ Estado Swarm en DB:', swarmRow.rows[0].status);
        if (swarmRow.rows[0].status !== 'SUCCESS') {
            throw new Error("El swarm debería estar en estado SUCCESS");
        }
        if (!swarmRow.rows[0].completed_at) {
            throw new Error("completed_at debería estar seteado");
        }

        console.log('\n✨ Test de Reanudación completado con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test Resume Swarm Fallido:', error.message);
        // Limpieza opcional si falló
        process.exit(1);
    }
}

testResumeSwarm();
