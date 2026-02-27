import express from 'express';
import bodyParser from 'body-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import winston from 'winston';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Logger Configuración Estructurada JSON
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/architect.log' })
    ]
});

const app = express();
// Límite explícito de body size: 100kb
app.use(bodyParser.json({ limit: '100kb' }));

const ajv = new Ajv({
    allErrors: true,
    strict: true,
    removeAdditional: false // Asegura que additionalProperties: false se respete estrictamente
});
addFormats(ajv);

// Load schema
const schemaPath = path.join(__dirname, 'schemas', 'plan.schema.json');
const planSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validatePlan = ajv.compile(planSchema);

const PORT = 8081;

/**
 * Validates strict JSON (no extra text)
 */
function isStrictJson(str) {
    const trimmed = str.trim();
    if (!((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']')))) {
        return false;
    }
    try {
        JSON.parse(trimmed);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Generates a SHA-256 hash of the normalized JSON object
 */
function calculatePlanHash(obj) {
    // We exclude the plan_hash field itself for calculation to be deterministic
    const { plan_hash, ...rest } = obj.plan;
    const normalized = JSON.stringify(rest, Object.keys(rest).sort());
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

app.post('/analyze', async (req, res) => {
    const correlationId = crypto.randomUUID();
    const { prompt } = req.body;

    if (!prompt) {
        logger.warn('Missing prompt', { correlationId });
        return res.status(400).json({ error: 'Missing prompt in request body', correlationId });
    }

    logger.info('Analyzing prompt', { correlationId, promptLength: prompt.length });

    // 20s Timeout para la "llamada al LLM"
    const timeoutMs = 20000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        // Simulación de llamada LLM con timeout
        const llmResponse = await simulateArchitectLLM(prompt, controller.signal);
        clearTimeout(timeoutId);

        const trimmed = llmResponse.trim();
        if (!isStrictJson(trimmed)) {
            logger.error('Polluted output detected', { correlationId });
            return res.status(400).json({ error: 'Model output contains extra text or is invalid JSON', correlationId });
        }

        const planData = JSON.parse(trimmed);

        // Validar Schema AJV
        const valid = validatePlan(planData);
        if (!valid) {
            logger.error('AJV Validation Failed', { correlationId, errors: validatePlan.errors });
            return res.status(400).json({
                error: 'Schema validation failed',
                details: validatePlan.errors,
                correlationId
            });
        }

        // Validar / Verificar Hash
        const calculatedHash = calculatePlanHash(planData);
        if (planData.plan.plan_hash !== calculatedHash) {
            logger.error('Plan Hash mismatch', { correlationId, expected: calculatedHash, got: planData.plan.plan_hash });
            // In this version we only log, but could also return 400
        }

        logger.info('Plan processed successfully', { correlationId, planId: planData.plan.id });
        return res.json(planData);

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            logger.error('LLM Request Timeout', { correlationId, timeoutMs });
            return res.status(504).json({ error: 'LLM Analysis timed out (20s)', correlationId });
        }
        logger.error('Architect Internal Error', { correlationId, message: error.message });
        return res.status(500).json({ error: 'Internal error', correlationId });
    }
});

async function simulateArchitectLLM(prompt, signal) {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (signal?.aborted) throw new Error('AbortError');

    if (prompt === 'trigger_pollute') {
        return 'Here is the plan: {"plan": {}}';
    }

    if (prompt === 'trigger_extra_field') {
        return JSON.stringify({
            plan: {
                id: "plan_20260227_0001",
                schema_version: "1.0.0",
                summary: "Valid plan but with extra field",
                created_at: new Date().toISOString(),
                extra_field: "not allowed",
                plan_hash: "...",
                steps: [],
                rollback: { on_failure: [], snapshot_required: true }
            }
        });
    }

    // Normal valid output
    const now = new Date().toISOString();
    const dateSlug = now.split('T')[0].replace(/-/g, '');

    let testId = "0001";
    if (prompt.includes('2')) testId = "0002";
    if (prompt.includes('3')) testId = "0003";
    if (prompt.includes('4')) testId = "0004";

    const mockPlan = {
        plan: {
            id: `plan_${dateSlug}_${testId}`,
            schema_version: "1.0.0",
            summary: `Atomic plan for: ${prompt}`,
            created_at: now,
            metadata: { author: "architect_agent", source: "user_v3" },
            steps: [
                {
                    step_id: "s1",
                    type: "file_write",
                    action: "write_test",
                    params: { filename: "canary_test.txt", content: "CANARY OK" },
                    inputs: [],
                    outputs: ["canary_test.txt"]
                }
            ],
            rollback: { on_failure: ["s1"], snapshot_required: true }
        }
    };

    // Inject real hash for valid response
    const hash = crypto.createHash('sha256').update(JSON.stringify(mockPlan.plan, Object.keys(mockPlan.plan).sort())).digest('hex');
    mockPlan.plan.plan_hash = hash;

    return JSON.stringify(mockPlan, null, 2);
}

app.listen(PORT, () => {
    logger.info(`[Architect Endurecido] Iniciado en puerto ${PORT}`);
});
