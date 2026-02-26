import https from 'https';

/**
 * Gemini AI Task Analyzer
 * Replaces regex-based keyword matching with intelligent task decomposition.
 * Uses Gemini Flash for near-zero cost analysis.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

// ─── System Prompt ───

function buildSystemPrompt() {
    return `Eres el cerebro estratégico de un sistema de orquestación de agentes de código llamados "Jules".
Tienes 3 cuentas de Jules, cada una especializada en un dominio:

1. **Lead Architect** (getxobelaeskola@gmail.com):
   - Diseño de arquitectura, schemas, OpenAPI contracts, tipos TypeScript
   - QA, code review, testing strategy, CI/CD
   - Planificación y estructura de proyecto

2. **Data Master** (ibaitnt@gmail.com):
   - Backend: APIs, endpoints, server logic
   - Base de datos: Supabase, PostgreSQL, migrations, queries
   - Integraciones: Stripe, webhooks, servicios externos

3. **UI Engine** (ibaitelexfree@gmail.com):
   - Frontend: React, Next.js components, pages
   - Estilos: CSS, Tailwind, animaciones, responsive design
   - UX: formularios, dashboards, navegación

PATRÓN DE RELAY (CRÍTICO):
- Las tareas se ejecutan en FASES SECUENCIALES: Architect → Data Master → UI Engine
- Cada fase posterior LEE el output (PRs, código) de la fase anterior
- Dentro de cada fase, los Jules trabajan EN PARALELO
- Esto minimiza errores porque cada especialista revisa el trabajo del anterior

REGLAS:
1. Distribuye los Jules de forma inteligente según la complejidad real
2. Cada tarea debe tener un prompt detallado y accionable para Jules
3. Las dependencias (depends_on) SOLO pueden apuntar a tareas de fases ANTERIORES
4. Si el usuario pide N jules, distribúyelos de forma óptima (no obligatoriamente N exactos)
5. El prompt de cada tarea debe incluir contexto suficiente para que Jules trabaje autónomamente
6. Repositorio del proyecto: ibaitelexfree-creator/getxobelaeskola (Next.js + Supabase)

Responde SOLO con JSON válido, sin markdown, sin backticks, sin explicaciones adicionales.`;
}

function buildUserPrompt(taskDescription, maxJules) {
    return `Analiza esta tarea y descomponla en subtareas para el swarm de Jules.
Máximo ${maxJules} Jules disponibles. Distribúyelos según necesidad real.

TAREA: ${taskDescription}

Responde con este JSON exacto:
{
  "total_jules": <número>,
  "phases": [
    {
      "order": 1,
      "role": "Lead Architect",
      "account": "getxobelaeskola@gmail.com",
      "jules_count": <número>,
      "tasks": [
        {
          "id": "arch-1",
          "title": "<título corto>",
          "prompt": "<prompt detallado para Jules>",
          "depends_on": []
        }
      ]
    },
    {
      "order": 2,
      "role": "Data Master",
      "account": "ibaitnt@gmail.com",
      "jules_count": <número>,
      "tasks": [
        {
          "id": "data-1",
          "title": "<título corto>",
          "prompt": "<prompt detallado para Jules>",
          "depends_on": ["arch-1"]
        }
      ]
    },
    {
      "order": 3,
      "role": "UI Engine",
      "account": "ibaitelexfree@gmail.com",
      "jules_count": <número>,
      "tasks": [
        {
          "id": "ui-1",
          "title": "<título corto>",
          "prompt": "<prompt detallado para Jules>",
          "depends_on": ["data-1"]
        }
      ]
    }
  ],
  "relay_strategy": "<descripción de cómo fluye el trabajo entre fases>",
  "estimated_time_minutes": <número>,
  "risk_notes": "<riesgos o notas importantes>"
}

Si alguna fase no es necesaria (ej: tarea solo de UI), omítela pero mantén el orden correcto.
No incluyas fases con 0 tareas.`;
}

// ─── Gemini API Call ───

const MODEL_FALLBACK_CHAIN = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001'
];

async function callGeminiWithModel(model, systemPrompt, userPrompt, apiKey) {
    const requestBody = JSON.stringify({
        contents: [
            { role: 'user', parts: [{ text: userPrompt }] }
        ],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json'
        }
    });

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        }, (res) => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => {
                try {
                    const data = JSON.parse(buf);
                    if (data.error) {
                        reject(new Error(`Gemini API [${model}]: ${data.error.message || JSON.stringify(data.error)}`));
                        return;
                    }
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) {
                        reject(new Error(`Gemini [${model}] returned empty response`));
                        return;
                    }
                    resolve(text);
                } catch (e) {
                    reject(new Error(`Failed to parse Gemini [${model}] response: ${e.message}`));
                }
            });
        });

        req.on('error', (e) => reject(new Error(`Gemini [${model}] request failed: ${e.message}`)));
        req.write(requestBody);
        req.end();
    });
}

async function callGemini(systemPrompt, userPrompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    let lastError;
    for (const model of MODEL_FALLBACK_CHAIN) {
        try {
            console.log(`[Gemini] Trying model: ${model}`);
            const result = await callGeminiWithModel(model, systemPrompt, userPrompt, apiKey);
            console.log(`[Gemini] Success with model: ${model}`);
            return result;
        } catch (e) {
            console.warn(`[Gemini] Model ${model} failed: ${e.message}`);
            lastError = e;
            // If rate limited, try next model
            if (e.message.includes('rate') || e.message.includes('limit') || e.message.includes('RESOURCE_EXHAUSTED')) {
                continue;
            }
            // If model not found, try next
            if (e.message.includes('not found') || e.message.includes('not supported')) {
                continue;
            }
            // For other errors, throw immediately
            throw e;
        }
    }

    throw lastError || new Error('All Gemini models exhausted');
}

// ─── Response Validation ───

function validateAnalysis(json) {
    if (typeof json.total_jules !== 'number' || json.total_jules < 1) {
        throw new Error('Invalid total_jules');
    }
    if (!Array.isArray(json.phases) || json.phases.length === 0) {
        throw new Error('No phases in analysis');
    }

    const validRoles = ['Lead Architect', 'Data Master', 'UI Engine'];
    const allTaskIds = new Set();

    for (const phase of json.phases) {
        if (!validRoles.includes(phase.role)) {
            throw new Error(`Unknown role: ${phase.role}`);
        }
        if (!Array.isArray(phase.tasks) || phase.tasks.length === 0) {
            throw new Error(`Phase ${phase.order} has no tasks`);
        }
        for (const task of phase.tasks) {
            if (!task.id || !task.title || !task.prompt) {
                throw new Error(`Task missing required fields: ${JSON.stringify(task)}`);
            }
            if (allTaskIds.has(task.id)) {
                throw new Error(`Duplicate task id: ${task.id}`);
            }
            allTaskIds.add(task.id);
        }
    }

    // Validate dependencies point to existing tasks from earlier phases
    const seenIds = new Set();
    for (const phase of json.phases.sort((a, b) => a.order - b.order)) {
        for (const task of phase.tasks) {
            for (const dep of (task.depends_on || [])) {
                if (!seenIds.has(dep)) {
                    // Dependency is from a task not yet processed — must be from same or later phase
                    // Allow it if it exists in allTaskIds (could be same phase parallel), but warn
                    if (!allTaskIds.has(dep)) {
                        throw new Error(`Task ${task.id} depends on unknown task: ${dep}`);
                    }
                }
            }
        }
        // Mark this phase's task IDs as seen
        for (const task of phase.tasks) {
            seenIds.add(task.id);
        }
    }

    return json;
}

// ─── Public API ───

/**
 * Analyze a task description and decompose it into a structured swarm plan.
 * @param {string} prompt - Task description
 * @param {number} maxJules - Maximum number of Jules to use
 * @returns {Promise<object>} - Structured analysis
 */
export async function analyzeTask(prompt, maxJules = 9) {
    console.log(`[Gemini] Analyzing task (max ${maxJules} Jules): "${prompt.slice(0, 80)}..."`);

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(prompt, maxJules);

    const rawText = await callGemini(systemPrompt, userPrompt);

    let parsed;
    try {
        // Clean any potential markdown wrapping
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
    } catch (e) {
        console.error('[Gemini] Failed to parse response:', rawText.slice(0, 500));
        throw new Error(`Gemini returned invalid JSON: ${e.message}`);
    }

    const validated = validateAnalysis(parsed);

    console.log(`[Gemini] Analysis complete: ${validated.total_jules} Jules across ${validated.phases.length} phases`);
    return validated;
}
