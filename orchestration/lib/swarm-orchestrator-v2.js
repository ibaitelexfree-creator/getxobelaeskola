import crypto from 'crypto';
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
        const swarmId = crypto.randomUUID();
        console.log(`[SwarmV2] 🐝 Iniciando Swarm Secuencial: ${swarmId}`);

        // 1. Crear registro de Swarm
        await pg.query(
            'INSERT INTO sw2_swarms (id, name, status, metadata) VALUES ($1, $2, $3, $4)',
            [swarmId, options.name || 'AutoSwarm', 'RUNNING', JSON.stringify({ taskDescription, ...options })]
        );

        return this._runExecutionLoop(swarmId, taskDescription, options);
    }

    /**
     * Intenta reanudar un swarm desde el último checkpoint
     */
    static async resumeSwarm(swarmId) {
        console.log(`[SwarmV2] 🔄 Reanudando Swarm: ${swarmId}`);

        // 1. Obtener datos del Swarm
        const swarmRes = await pg.query('SELECT * FROM sw2_swarms WHERE id = $1', [swarmId]);
        if (swarmRes.rowCount === 0) {
            throw new Error(`Swarm ${swarmId} no encontrado`);
        }

        const swarm = swarmRes.rows[0];
        const metadata = typeof swarm.metadata === 'string' ? JSON.parse(swarm.metadata) : swarm.metadata;
        const taskDescription = metadata.taskDescription;

        // 2. Obtener tareas completadas
        const tasksRes = await pg.query(
            'SELECT agent_role, response_payload FROM sw2_tasks WHERE swarm_id = $1 AND status = $2',
            [swarmId, 'SUCCESS']
        );

        const completedTasks = tasksRes.rows.reduce((acc, row) => {
            acc[row.agent_role] = typeof row.response_payload === 'string'
                ? JSON.parse(row.response_payload)
                : row.response_payload;
            return acc;
        }, {});

        console.log(`[SwarmV2] Tareas recuperadas: ${Object.keys(completedTasks).join(', ') || 'Ninguna'}`);

        // 3. Actualizar estado a RUNNING
        await pg.query(
            'UPDATE sw2_swarms SET status = $1, updated_at = NOW() WHERE id = $2',
            ['RUNNING', swarmId]
        );

        return this._runExecutionLoop(swarmId, taskDescription, metadata, completedTasks);
    }

    /**
     * Ciclo de ejecución compartido entre inicio nuevo y reanudación
     */
    static async _runExecutionLoop(swarmId, taskDescription, options, completedTasks = {}) {
        try {
            // 1. Clasificación (Opcional si ya se hizo, pero barato)
            if (Object.keys(completedTasks).length === 0) {
                const classification = await Classifier.classifyTask(taskDescription);
                console.log(`[SwarmV2] Tarea clasificada: ${classification}`);
            }

            // 2. Fase 1: ARCHITECT
            let architectOutput = completedTasks['architect'];
            if (!architectOutput) {
                console.log('\n--- 🏗️  FASE: ARCHITECT ---');
                architectOutput = await JulesExecutor.executeWithRetry('architect', {
                    description: taskDescription,
                    context: options.context || ''
                }, swarmId);
            } else {
                console.log('\n--- 🏗️  FASE: ARCHITECT (Skipped - Already Completed) ---');
            }

            if (architectOutput.vote === 'FAIL') {
                throw new Error(`Architect bloqueó la tarea: ${architectOutput.vote_reason}`);
            }

            // 3. Fase 2: DATA (Con contexto del Arquitecto)
            let dataOutput = completedTasks['data'];
            if (!dataOutput) {
                console.log('\n--- 🗄️  FASE: DATA MASTER ---');
                const dataTask = `Realiza la implementación backend y bases de datos para esta tarea: "${taskDescription}".\n\nDISEÑO DEL ARQUITECTO:\n${JSON.stringify(architectOutput, null, 2)}`;
                dataOutput = await JulesExecutor.executeWithRetry('data', {
                    description: dataTask,
                    context: options.context || ''
                }, swarmId);
            } else {
                console.log('\n--- 🗄️  FASE: DATA MASTER (Skipped - Already Completed) ---');
            }

            if (dataOutput.vote === 'FAIL') {
                throw new Error(`Data Master bloqueó la tarea: ${dataOutput.vote_reason}`);
            }

            // 4. Fase 3: UI (Con contexto de ambos)
            let uiOutput = completedTasks['ui'];
            if (!uiOutput) {
                console.log('\n--- 🎨  FASE: UI ENGINE ---');
                const uiTask = `Crea la interfaz de usuario para esta tarea: "${taskDescription}".\n\nDISEÑO ARQUITECTÓNICO:\n${JSON.stringify(architectOutput, null, 2)}\n\nIMPLEMENTACIÓN BACKEND:\n${JSON.stringify(dataOutput, null, 2)}`;
                uiOutput = await JulesExecutor.executeWithRetry('ui', {
                    description: uiTask,
                    context: options.context || ''
                }, swarmId);
            } else {
                console.log('\n--- 🎨  FASE: UI ENGINE (Skipped - Already Completed) ---');
            }

            // 5. Finalización Exitosa
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
}

export default SwarmOrchestratorV2;
