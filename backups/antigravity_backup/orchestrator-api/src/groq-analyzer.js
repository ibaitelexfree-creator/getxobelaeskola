import https from 'https';

/**
 * Groq AI Task Analyzer (using Llama-3.3-70b-versatile)
 * Replaces Gemini analysis with Groq for task decomposition.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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

Responde SOLO con JSON válido de acuerdo a la estructura que el usuario pida.`;
}

function buildUserPrompt(taskDescription, maxJules) {
    return `Analiza esta tarea y descomponla en subtareas para el swarm de Jules.
Máximo ${maxJules} Jules disponibles. Distribúyelos según necesidad real.

TAREA: ${taskDescription}

Responde EXACTAMENTE con este JSON (debes rellenarlo tú sin añadir texto extra, la raíz debe ser un objeto):
{
  "total_jules": 8,
  "phases": [
    {
      "order": 1,
      "role": "Lead Architect",
      "account": "getxobelaeskola@gmail.com",
      "jules_count": 2,
      "tasks": [
        {
          "id": "arch-1",
          "title": "titulo",
          "prompt": "prompt",
          "depends_on": []
        }
      ]
    }
  ],
  "relay_strategy": "estrategia",
  "estimated_time_minutes": 60,
  "risk_notes": "riesgos"
}

Si alguna fase no es necesaria (ej: tarea solo de UI), omítela pero mantén el orden correcto.
No incluyas fases con 0 tareas.`;
}

// ─── Groq API Call ───

async function callGroq(systemPrompt, userPrompt) {
    const requestBody = JSON.stringify({
        model: GROQ_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
    });

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.groq.com',
            port: 443,
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
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
                        reject(new Error(`Groq API: ${data.error.message || JSON.stringify(data.error)}`));
                        return;
                    }
                    const text = data.choices?.[0]?.message?.content;
                    if (!text) {
                        reject(new Error(`Groq returned empty response: ${buf}`));
                        return;
                    }
                    resolve(text);
                } catch (e) {
                    reject(new Error(`Failed to parse Groq response: ${e.message}`));
                }
            });
        });

        req.on('error', (e) => reject(new Error(`Groq request failed: ${e.message}`)));
        req.write(requestBody);
        req.end();
    });
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

    const seenIds = new Set();
    for (const phase of json.phases.sort((a, b) => a.order - b.order)) {
        for (const task of phase.tasks) {
            for (const dep of (task.depends_on || [])) {
                if (!seenIds.has(dep)) {
                    if (!allTaskIds.has(dep)) {
                        throw new Error(`Task ${task.id} depends on unknown task: ${dep}`);
                    }
                }
            }
        }
        for (const task of phase.tasks) {
            seenIds.add(task.id);
        }
    }

    return json;
}

// ─── Public API ───

export async function analyzeTask(prompt, maxJules = 9) {
    console.log(`[Groq] Analyzing task (max ${maxJules} Jules): "${prompt.slice(0, 80)}..."`);

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(prompt, maxJules);

    const rawText = await callGroq(systemPrompt, userPrompt);

    let parsed;
    try {
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
    } catch (e) {
        console.error('[Groq] Failed to parse response:', rawText.slice(0, 500));
        throw new Error(`Groq returned invalid JSON: ${e.message}`);
    }

    const validated = validateAnalysis(parsed);

    console.log(`[Groq] Analysis complete: ${validated.total_jules} Jules across ${validated.phases.length} phases`);
    return validated;
}
