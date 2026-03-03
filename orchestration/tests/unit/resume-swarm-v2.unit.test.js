import { describe, it, expect, beforeEach, mock } from 'bun:test';
import SwarmOrchestratorV2 from '../../lib/swarm-orchestrator-v2.js';
import pg from '../../lib/pg-client.js';
import JulesExecutor from '../../lib/jules-executor.js';
import Classifier from '../../lib/classifier.js';

// Mocking dependencies using Bun's mock
mock.module('../../lib/pg-client.js', () => ({
  default: {
    query: mock(() => Promise.resolve({ rowCount: 0, rows: [] }))
  }
}));

mock.module('../../lib/jules-executor.js', () => ({
  default: {
    executeWithRetry: mock(() => Promise.resolve({ vote: 'OK' }))
  }
}));

mock.module('../../lib/classifier.js', () => ({
  default: {
    classifyTask: mock(() => Promise.resolve('ARCHITECT'))
  }
}));

describe('SwarmOrchestratorV2 - resumeSwarm', () => {
    beforeEach(() => {
        // Reset mocks manually if needed, but Bun's mock.module is quite static
        pg.query.mockClear();
        JulesExecutor.executeWithRetry.mockClear();
        Classifier.classifyTask.mockClear();
    });

    it('should resume from the DATA phase if ARCHITECT is already completed', async () => {
        const swarmId = 'test-swarm-id';
        const taskDescription = 'Test task';

        // 1. Mock Swarm fetch
        pg.query.mockImplementation((text, params) => {
            if (text.includes('SELECT * FROM sw2_swarms')) {
                return Promise.resolve({
                    rowCount: 1,
                    rows: [{
                        id: swarmId,
                        metadata: JSON.stringify({ taskDescription }),
                        status: 'BLOCKED'
                    }]
                });
            }
            if (text.includes('SELECT agent_role, response_payload FROM sw2_tasks')) {
                return Promise.resolve({
                    rowCount: 1,
                    rows: [{
                        agent_role: 'architect',
                        response_payload: JSON.stringify({ vote: 'OK', design: 'test-design' })
                    }]
                });
            }
            return Promise.resolve({ rowCount: 0, rows: [] });
        });

        // 2. Mock JulesExecutor
        JulesExecutor.executeWithRetry.mockImplementation((role) => {
            return Promise.resolve({ vote: 'OK', role_output: `output-for-${role}` });
        });

        // 3. Execute resume
        const result = await SwarmOrchestratorV2.resumeSwarm(swarmId);

        // 4. Assertions
        expect(result.status).toBe('SUCCESS');
        expect(result.outputs.architect.vote).toBe('OK');
        expect(result.outputs.architect.design).toBe('test-design');
        expect(result.outputs.data.role_output).toBe('output-for-data');
        expect(result.outputs.ui.role_output).toBe('output-for-ui');

        // Verify ARCHITECT was NOT called but DATA and UI were
        // In Bun, we check mock.calls
        const architectCalls = JulesExecutor.executeWithRetry.mock.calls.filter(call => call[0] === 'architect');
        expect(architectCalls.length).toBe(0);

        const dataCalls = JulesExecutor.executeWithRetry.mock.calls.filter(call => call[0] === 'data');
        expect(dataCalls.length).toBe(1);

        const uiCalls = JulesExecutor.executeWithRetry.mock.calls.filter(call => call[0] === 'ui');
        expect(uiCalls.length).toBe(1);

        // Verify DB updates
        const updates = pg.query.mock.calls.filter(call => call[0].includes('UPDATE sw2_swarms SET status = $1'));
        expect(updates.length).toBe(2); // One for RUNNING, one for SUCCESS
    });

    it('should throw error if swarm not found', async () => {
        pg.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
        try {
            await SwarmOrchestratorV2.resumeSwarm('non-existent');
            expect(true).toBe(false); // Should not reach here
        } catch (e) {
            expect(e.message).toBe('Swarm non-existent no encontrado');
        }
    });

    it('should execute sequential swarm from scratch', async () => {
        const taskDescription = 'New sequential task';

        // Mock DB for insertion
        pg.query.mockImplementation((text, params) => {
            return Promise.resolve({ rowCount: 1, rows: [] });
        });

        // Mock JulesExecutor
        JulesExecutor.executeWithRetry.mockImplementation((role) => {
            return Promise.resolve({ vote: 'OK', role_output: `output-for-${role}` });
        });

        // Mock Classifier
        Classifier.classifyTask.mockResolvedValue('ARCHITECT');

        // Execute
        const result = await SwarmOrchestratorV2.executeSequential(taskDescription, { name: 'NewSwarm' });

        // Assertions
        expect(result.status).toBe('SUCCESS');
        expect(result.outputs.architect.role_output).toBe('output-for-architect');
        expect(result.outputs.data.role_output).toBe('output-for-data');
        expect(result.outputs.ui.role_output).toBe('output-for-ui');

        // Verify all phases were called
        expect(JulesExecutor.executeWithRetry).toHaveBeenCalledWith('architect', expect.anything(), expect.anything());
        expect(JulesExecutor.executeWithRetry).toHaveBeenCalledWith('data', expect.anything(), expect.anything());
        expect(JulesExecutor.executeWithRetry).toHaveBeenCalledWith('ui', expect.anything(), expect.anything());

        // Verify swarm creation call
        const creationCall = pg.query.mock.calls.find(call => call[0].includes('INSERT INTO sw2_swarms'));
        expect(creationCall).toBeDefined();
        expect(creationCall[1]).toContain('NewSwarm');
    });
});
