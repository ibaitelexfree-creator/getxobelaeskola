import { v4 as uuidv4 } from 'uuid';
import pg from './pg-client.js';
import RateGuard from './rate-guard.js';
import JulesExecutor from './jules-executor.js';
import Classifier from './classifier.js';

/**
 * SwarmOrchestratorV2: El cerebro secuencial/paralelo del Swarm.
 * Fase 3.4 - Coordina la ejecución de expertos y el paso de contexto.
 */
export class SwarmOrchestratorV2 {
    /**
     * Ejecuta un swarm completo de forma secuencial
     * @param {string} taskDescription 
     * @param {Object} options 
     */
    static async executeSequential(taskDescription, options = {}) {
        const swarmId = uuidv4();
        console.log(`[SwarmV2] 🐝 Iniciando Swarm Secuencial: ${swarmId}`);

        // 1. Crear registro de Swarm
        await pg.query(
            'INSERT INTO sw2_swarms (id, name, status, metadata) VALUES ($1, $2, $3, $4)',
            [swarmId, options.name || 'AutoSwarm', 'RUNNING', JSON.stringify({ taskDescription, ...options })]
        );

        try {
            // 2. Clasificación inicial (para metadata)
            const classification = await Classifier.classifyTask(taskDescription);
            console.log(`[SwarmV2] Tarea clasificada: ${classification}`);

            // 3. Fase 1: ARCHITECT
            console.log('\n--- 🏗️  FASE: ARCHITECT ---');
            const architectOutput = await JulesExecutor.executeWithRetry('architect', {
                description: taskDescription,
                context: options.context || ''
            }, swarmId);

            if (architectOutput.vote === 'FAIL') {
                throw new Error(`Architect bloqueó la tarea: ${architectOutput.vote_reason}`);
            }

            // 4. Fase 2: DATA (Con contexto del Arquitecto)
            console.log('\n--- 🗄️  FASE: DATA MASTER ---');
            const dataTask = `Realiza la implementación backend y bases de datos para esta tarea: "${taskDescription}".\n\nDISEÑO DEL ARQUITECTO:\n${JSON.stringify(architectOutput, null, 2)}`;
            const dataOutput = await JulesExecutor.executeWithRetry('data', {
                description: dataTask,
                context: options.context || ''
            }, swarmId);

            if (dataOutput.vote === 'FAIL') {
                throw new Error(`Data Master bloqueó la tarea: ${dataOutput.vote_reason}`);
            }

            // 5. Fase 3: UI (Con contexto de ambos)
            console.log('\n--- 🎨  FASE: UI ENGINE ---');
            const uiTask = `Crea la interfaz de usuario para esta tarea: "${taskDescription}".\n\nDISEÑO ARQUITECTÓNICO:\n${JSON.stringify(architectOutput, null, 2)}\n\nIMPLEMENTACIÓN BACKEND:\n${JSON.stringify(dataOutput, null, 2)}`;
            const uiOutput = await JulesExecutor.executeWithRetry('ui', {
                description: uiTask,
                context: options.context || ''
            }, swarmId);

            // 6. Finalización Exitosa
            await pg.query(
                'UPDATE sw2_swarms SET status = $1, updated_at = NOW(), completed_at = NOW() WHERE id = $2',
                ['SUCCESS', swarmId]
            );

            console.log(`\n✅ Swarm ${swarmId} completado con éxito.`);
            return {
                swarmId,
                status: 'SUCCESS',
                outputs: {
                    architect: architectOutput,
                    data: dataOutput,
                    ui: uiOutput
                }
            };

        } catch (error) {
            console.error(`\n❌ Swarm ${swarmId} fallido:`, error.message);

            await pg.query(
                'UPDATE sw2_swarms SET status = $1, updated_at = NOW() WHERE id = $2',
                ['BLOCKED', swarmId]
            );

            // Registrar evento en el historial
            await pg.query(
                'INSERT INTO sw2_history (swarm_id, event_type, message) VALUES ($1, $2, $3)',
                [swarmId, 'CRITICAL_FAILURE', error.message]
            );

            throw error;
        }
    }

    /**
     * Intenta reanudar un swarm desde el último checkpoint
     */
    static async resumeSwarm(swarmId) {
        // TODO: Implementar lógica de recuperación leyendo sw2_tasks
        console.log(`[SwarmV2] Reanudación de ${swarmId} solicitada (Not Implemented yet)`);
    }
}

export default SwarmOrchestratorV2;
