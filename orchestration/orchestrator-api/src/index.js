import 'dotenv/config';
console.log('--- STARTING ORCHESTRATOR API v2.0.1 (DEBUG ENABLED) ---');
import express from 'express';
import pg from 'pg';
import axios from 'axios';
import crypto from 'crypto';
import dns from 'dns';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import * as metrics from './metrics.js';
import { sendTelegramMessage } from './telegram.js';
import { createDashboardSnapshot } from './grafana-service.js';
import { analyzeTask } from './groq-analyzer.js';
import { startPolling, sendMessage, formatProposal, storeProposal } from './telegram-bot.js';
import * as taskQueue from './task-queue.js';
import { executeSwarm, isSimulationMode, getActiveSwarms, getHealthReport, resumeActiveTasks } from './swarm-executor.js';
import { ACCOUNTS_MAP, ACCOUNT_ROLES, buildAuthHeaders, validateAllKeys } from './account-health.js';

// Fix connection hangs by prioritizing IPv4
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const app = express();
app.use(cors());

// Configuration
const JULES_API_KEY = process.env.JULES_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Added GROQ_API_KEY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3002;

// Request ID middleware and Metrics
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    if (metrics.httpRequestDuration) {
      metrics.httpRequestDuration.observe(
        { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode },
        duration
      );
    }
  });
  next();
});

// JSON parsing
app.use(express.json());

// Initialize database
let db = null;
if (DATABASE_URL) {
  db = new pg.Pool({ connectionString: DATABASE_URL });
  console.log('[Init] Database pool created');

  // Initialize task queue schema and then resume any active tasks
  taskQueue.initializeSchema(db).then(() => {
    console.log('[Init] TaskQueue schema initialized.');
    // Resume any tasks that were running before shutdown/restart
    resumeActiveTasks(db).catch(e => console.error('[Init] Resumption failure:', e.message));
  }).catch(e => console.warn('[Init] TaskQueue schema warning:', e.message));
}

// Routes
app.get('/api/v1/metrics', async (req, res) => {
  res.set('Content-Type', metrics.registerContentType);
  res.end(await metrics.getMetrics());
});

app.get(['/health', '/api/v1/health'], async (req, res) => {
  res.json({
    status: 'ok',
    version: '1.6.0',
    services: { database: db ? 'connected' : 'none' },
    timestamp: new Date().toISOString()
  });
});

// Chaos Engineering Endpoints
app.get('/api/v1/chaos/:type', async (req, res) => {
  const { type } = req.params;
  const { code, ms, mb } = req.query;

  console.log(`[Chaos] Executing experiment: ${type}`);

  if (type === 'latency') {
    const delay = parseInt(ms) || 2000;
    await new Promise(r => setTimeout(r, delay));
    return res.json({ success: true, delay });
  }

  if (type === 'error') {
    const status = parseInt(code) || 500;
    return res.status(status).json({
      success: false,
      error: 'Chaos Simulation',
      code: status
    });
  }

  res.status(400).json({ error: 'Unknown chaos type' });
});

// --- Swarm Negotiation & Dispatch Logic ---
// This endpoint proposes which agents are needed based on a user request
// NOW POWERED BY GEMINI AI (was regex-based)
app.post('/api/v1/swarm/negotiate', async (req, res) => {
  const { prompt, complexity = 'medium', max_jules = 9, dispatch = false } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    // Use Gemini AI for intelligent task decomposition
    const analysis = await analyzeTask(prompt, max_jules);

    // Store as a proposal
    const proposalId = await taskQueue.createProposal(db, {
      chatId: req.body.telegram_chat_id || process.env.TELEGRAM_CHAT_ID,
      prompt,
      maxJules: max_jules,
      analysis
    });

    // Store in bot memory too
    storeProposal(proposalId, { originalPrompt: prompt, analysis });

    // Telegram Notification
    const formattedMsg = formatProposal(proposalId, analysis);
    sendTelegramMessage(formattedMsg).catch(e => console.error('[Negotiate] Telegram failed:', e.message));

    // Auto-dispatch if requested
    let executed = false;
    if (dispatch) {
      const approved = await taskQueue.approveProposal(db, proposalId);
      if (approved) {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        executeSwarm(db, proposalId, chatId, {
          simulationMode: isSimulationMode()
        }).catch(e => console.error('[Swarm] Execution error:', e.message));
        executed = true;
      }
    }

    res.json({
      success: true,
      message: 'AI-Powered Swarm Proposal',
      proposal_id: proposalId,
      analysis,
      ai_powered: true,
      auto_dispatched: executed
    });
  } catch (e) {
    console.error('[Negotiate] AI Analysis Error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── Swarm Approval & Execution ───
app.post('/api/v1/swarm/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await taskQueue.approveProposal(db, id);
    if (!result) return res.status(404).json({ error: 'Proposal not found or not pending' });

    const chatId = process.env.TELEGRAM_CHAT_ID;
    sendMessage(chatId, `🚀 *Swarm \`#${id}\` aprobado!* Iniciando ejecución...`).catch(() => { });

    // Start execution in background
    executeSwarm(db, id, chatId, { simulationMode: isSimulationMode() })
      .catch(e => console.error('[Swarm] Execution error:', e.message));

    res.json({ success: true, message: `Swarm ${id} approved and executing`, task_count: result.taskCount });
  } catch (e) {
    console.error('[Swarm Approve] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/v1/swarm/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await taskQueue.cancelProposal(db, id);
    if (!result) return res.status(404).json({ error: 'Proposal not found or not pending' });
    res.json({ success: true, message: `Swarm ${id} cancelled` });
  } catch (e) {
    console.error('[Swarm Cancel] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/v1/swarm/progress/:id', async (req, res) => {
  try {
    const progress = await taskQueue.getSwarmProgress(db, req.params.id);
    const tasks = await taskQueue.getSwarmTasks(db, req.params.id);
    res.json({ success: true, progress, tasks });
  } catch (e) {
    console.error('[Swarm Progress] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/v1/swarm/active', async (req, res) => {
  try {
    res.json({ success: true, active: getActiveSwarms() });
  } catch (e) {
    console.error('[Swarm Active] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Swarm Pool Status (uses shared module)
app.get('/api/v1/swarm/status', async (req, res) => {
  const status = Object.keys(ACCOUNTS_MAP).map(email => ({
    email,
    role: ACCOUNT_ROLES[email] || 'Unknown',
    active_sessions: 0
  }));
  res.json({ success: true, pool: status });
});

// Phase 1: Account Health Check
app.get('/api/v1/swarm/health', async (req, res) => {
  try {
    const validate = req.query.validate === 'true';
    if (validate) {
      const validationResults = await validateAllKeys();
      res.json({ success: true, health: getHealthReport(), validation: validationResults });
    } else {
      res.json({ success: true, health: getHealthReport() });
    }
  } catch (e) {
    console.error('[Swarm Health] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Phase 5: Swarm Retry (re-run failed tasks only)
app.post('/api/v1/swarm/retry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resetCount = await taskQueue.resetFailedTasks(db, id);
    if (resetCount === 0) {
      return res.status(404).json({ error: 'No failed tasks found for this swarm' });
    }
    const chatId = process.env.TELEGRAM_CHAT_ID;
    sendMessage(chatId, `🔄 *Swarm \`#${id}\` retry!* ${resetCount} tareas fallidas reseteadas.`).catch(() => { });
    executeSwarm(db, id, chatId, { simulationMode: isSimulationMode() })
      .catch(e => sendMessage(chatId, `❌ Retry error: ${e.message}`));
    res.json({ success: true, message: `Swarm ${id} retrying ${resetCount} failed tasks` });
  } catch (e) {
    console.error('[Swarm Retry] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Incident Webhook Handler
app.post('/api/v1/incidents/webhook', async (req, res) => {
  const requestId = req.requestId;
  const { status, commonLabels, commonAnnotations, externalURL } = req.body;

  console.log(`[${requestId}] Incident Webhook: status=${status}, alert=${commonLabels?.alertname}`);

  try {
    let message = '';
    const alertName = commonLabels?.alertname || 'Unnamed Alert';

    if (status === 'firing') {
      message = `🔥 *INCIDENT DETECTED* 🔥\n\n`;
      message += `*Alert:* ${alertName}\n`;
      message += `*Severity:* ${commonLabels?.severity || 'unknown'}\n\n`;

      let snapshotUrl = null;
      if (commonLabels?.dashboard_uid) {
        try {
          snapshotUrl = await createDashboardSnapshot(commonLabels.dashboard_uid);
          console.log(`[${requestId}] Generated Snapshot: ${snapshotUrl}`);
        } catch (e) {
          console.error(`[${requestId}] Snapshot generation failed:`, e.message);
        }
      }

      if (snapshotUrl) {
        message += `📊 *Self-Contained Dashboard:* [Click here for proof](${snapshotUrl})\n\n`;
      } else {
        message += `📊 [View in Grafana](${externalURL})\n\n`;
      }

      message += `📌 *Summary:* ${commonAnnotations?.summary || 'No summary provided'}`;
    } else {
      message = `✅ *INCIDENT RESOLVED* ✅\n\n`;
      message += `*Alert:* ${alertName}\n`;
      message += `*Status:* All systems green. System restored to normal operation.`;
    }

    const telResult = await sendTelegramMessage(message, { parseMode: 'Markdown' });
    console.log(`[${requestId}] Telegram notification sent:`, telResult.success);

    res.status(200).json({ success: true, snapshot: !!message.includes('Snapshot') });
  } catch (error) {
    console.error(`[${requestId}] Webhook Handler Critical Error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Jules Session Management (Swarm Orchestration) ───
// ACCOUNTS_MAP is now imported from account-health.js (single source of truth)
// Jules 1 (Architect/QA): getxobelaeskola@gmail.com → JULES_API_KEY
// Jules 2 (Data Master):  ibaitnt@gmail.com         → JULES_API_KEY_2
// Jules 3 (UI Engine):    ibaitelexfree@gmail.com    → JULES_API_KEY_3

/**
 * Jules Session Creation Endpoint
 * Handles requests from n8n Swarm nodes.
 * Maps parameters -> Jules API schema.
 */
app.post('/api/v1/sessions', async (req, res) => {
  const requestId = req.requestId;
  const { parameters } = req.body;

  if (!parameters || !Array.isArray(parameters)) {
    return res.status(400).json({ success: false, error: 'Missing or invalid parameters array' });
  }

  // Extract values from parameters array (n8n style)
  const taskParam = parameters.find(p => p.name === 'task');
  const repoParam = parameters.find(p => p.name === 'repository');
  const accountParam = parameters.find(p => p.name === 'account');

  const task = taskParam ? taskParam.value : null;
  const repository = repoParam ? repoParam.value : 'ibaitelexfree-creator/getxobelaeskola';
  const accountEmail = accountParam ? accountParam.value : 'ibaitelexfree@gmail.com';

  if (!task) {
    return res.status(400).json({ success: false, error: 'Task description is required' });
  }

  // Identity selection based on swarm role
  const apiKey = ACCOUNTS_MAP[accountEmail] || process.env.JULES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: `No API key configured for account: ${accountEmail}. Check environment variables.`
    });
  }

  console.log(`[${requestId}] [SWARM] Creating Jules session | Account: ${accountEmail} | Repo: ${repository}`);

  try {
    // Proxy to real Jules API (v1alpha)
    const response = await axios.post('https://jules.googleapis.com/v1alpha/sessions', {
      prompt: task,
      sourceContext: {
        source: repository.startsWith('sources/') ? repository : `sources/github/${repository}`,
        githubRepoContext: {
          startingBranch: 'main'
        }
      },
      automationMode: 'AUTO_CREATE_PR' // Always enable PR creation for swarm agents
    }, {
      headers: buildAuthHeaders(apiKey)
    });

    const pollParam = parameters.find(p => p.name === 'wait');
    const wait = pollParam ? pollParam.value === true || pollParam.value === 'true' : false;
    const timeout = 600000; // 10 minutes max wait

    console.log(`[${requestId}] [SWARM] Success: ${response.data.name}${wait ? ' (Waiting for completion...)' : ''}`);

    if (wait) {
      if (metrics.julesPoolGauge) {
        metrics.julesPoolGauge.inc({ account: accountEmail, role: accountEmail.split('@')[0] });
      }

      const sessionId = response.data.name;
      const startTime = Date.now();
      let sessionState = 'STATE_UNSPECIFIED';
      let finalSession = null;

      while (Date.now() - startTime < timeout) {
        // Poll Jules API for status
        try {
          const statusRes = await axios.get(`https://jules.googleapis.com/v1alpha/${sessionId}`, {
            headers: buildAuthHeaders(apiKey)
          });

          finalSession = statusRes.data;
          sessionState = finalSession.state;

          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(sessionState)) {
            break;
          }
        } catch (pollError) {
          console.warn(`[${requestId}] [SWARM] Polling error for ${sessionId}:`, pollError.message);
        }

        // Wait 10 seconds before next poll
        await new Promise(r => setTimeout(r, 10000));
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`[${requestId}] [SWARM] Session ${sessionId} finished with state ${sessionState} after ${duration}s`);

      if (metrics.julesPoolGauge) {
        metrics.julesPoolGauge.dec({ account: accountEmail, role: accountEmail.split('@')[0] });
      }

      return res.json({
        success: sessionState === 'COMPLETED',
        sessionId: sessionId,
        status: sessionState,
        result: finalSession?.result || "NO_RESULT",
        full_session: finalSession,
        identity: accountEmail
      });
    }

    // Incrementar métricas (non-blocking case)
    if (metrics.julesTaskCounter) {
      metrics.julesTaskCounter.inc({ status: 'success', account: accountEmail });
    }

    res.json({
      success: true,
      sessionId: response.data.name,
      result: "SESSION_CREATED",
      identity: accountEmail
    });

  } catch (error) {
    const errorData = error.response?.data || { error: error.message };
    console.error(`[${requestId}] [SWARM] Jules API Error:`, JSON.stringify(errorData));

    if (metrics.julesTaskCounter) {
      metrics.julesTaskCounter.inc({ status: 'error', account: accountEmail });
    }

    if (wait && metrics.julesPoolGauge) {
      metrics.julesPoolGauge.dec({ account: accountEmail, role: accountEmail.split('@')[0] });
    }

    res.status(error.response?.status || 500).json({
      success: false,
      ...errorData,
      source: "JulesOrchestratorAPI"
    });
  }
});

// ─── NotebookLM Report Automation ───
app.post('/api/v1/notebooklm/report', async (req, res) => {
  const requestId = req.requestId;
  console.log(`[${requestId}] Triggering NotebookLM Report Generation...`);

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execPromise = promisify(exec);
    const path = await import('path');

    // 1. Generar la fuente (notebooklm_source.txt)
    console.log(`[${requestId}] Step 1: Generating source text...`);
    await execPromise('node scripts/generate_ai_report_source.js', { cwd: process.cwd(), windowsHide: true });

    // 2. Ejecutar la automatización de NotebookLM
    // NOTA: Esto requiere que Chrome esté disponible y logueado en la máquina host.
    console.log(`[${requestId}] Step 2: Running Puppeteer automation...`);
    const { stdout, stderr } = await execPromise('node scripts/notebooklm_automation.js', { cwd: process.cwd(), windowsHide: true });

    if (stderr) console.warn(`[${requestId}] Puppeteer Warning:`, stderr);
    console.log(`[${requestId}] Puppeteer Output:`, stdout);

    // 3. Enviar a n8n
    console.log(`[${requestId}] Step 3: Sending artifacts to n8n...`);
    const n8nWebhookUrl = 'https://n8n.srv1368175.hstgr.cloud/webhook/trigger-report';

    // Rutas esperadas (ajustar según descargas reales de Chrome)
    const fs = await import('fs');
    const podcastPath = path.join(process.cwd(), 'scripts', 'podcast_espanol.mp3');
    const introPath = path.join(process.cwd(), 'scripts', 'infografia_proyecto.png');

    // Crear archivos dummy para la prueba si no existen
    if (!fs.existsSync(podcastPath)) fs.writeFileSync(podcastPath, 'dummy podcast content');
    if (!fs.existsSync(introPath)) fs.writeFileSync(introPath, 'dummy infographic content');

    const formData = new FormData();
    const podcastFile = fs.readFileSync(podcastPath);
    const introFile = fs.readFileSync(introPath);

    formData.append('file1', new Blob([podcastFile]), 'podcast.mp3');
    formData.append('file2', new Blob([introFile]), 'infografia.png');

    const n8nRes = await fetch(n8nWebhookUrl, {
      method: 'POST',
      body: formData
    });

    const n8nData = await n8nRes.text();
    console.log(`[${requestId}] n8n Response:`, n8nData);

    res.json({
      success: true,
      message: 'Reporte generado y enviado a n8n.',
      n8n: n8nData
    });

  } catch (error) {
    console.error(`[${requestId}] NotebookLM Error:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
const server = createServer(app);
const wss = new WebSocketServer({ server });

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Jules Orchestrator API v2.0.0 listening on 0.0.0.0:${PORT}`);

  // Start Telegram Bot polling
  const chatId = process.env.TELEGRAM_CHAT_ID;
  startPolling({
    onSwarm: async (cid, prompt, maxJules) => {
      console.log(`[TelegramBot] Swarm requested by CID ${cid}: "${prompt.substring(0, 50)}..."`);
      try {
        const analysis = await analyzeTask(prompt, maxJules);
        const proposalId = await taskQueue.createProposal(db, { chatId: cid, prompt, maxJules, analysis });
        storeProposal(proposalId, { originalPrompt: prompt, analysis });
        await sendMessage(cid, formatProposal(proposalId, analysis));
      } catch (e) {
        console.error(`[TelegramBot] Swarm analysis failed for CID ${cid}:`, e.message);
        await sendMessage(cid, `❌ Error de Groq AI: ${e.message}`);
      }
    },
    onApprove: async (cid, id, filters) => {
      const result = await taskQueue.approveProposal(db, id, filters);
      if (!result) { await sendMessage(cid, `❌ Propuesta \`${id}\` no encontrada o ya procesada.`); return; }
      const filterMsg = result.filtered ? ` (Vista filtrada: ${result.taskCount} tareas)` : ` (${result.taskCount} tareas)`;
      await sendMessage(cid, `🚀 *Swarm \`#${id}\` aprobado!*${filterMsg} en cola.`);
      executeSwarm(db, id, cid, { simulationMode: isSimulationMode() })
        .catch(e => sendMessage(cid, `❌ Error de ejecución: ${e.message}`));
    },
    onCancel: async (cid, id) => {
      const result = await taskQueue.cancelProposal(db, id);
      if (!result) { await sendMessage(cid, `❌ Propuesta \`${id}\` no encontrada.`); return; }
      await sendMessage(cid, `🗑️ Propuesta \`#${id}\` cancelada.`);
    },
    onStatus: async (cid) => {
      const active = getActiveSwarms();
      if (active.length === 0) {
        await sendMessage(cid, '📭 No hay swarms activos.');
      } else {
        const lines = active.map(s => `• \`${s.id}\`: ${s.status} (${s.runningFor})`);
        await sendMessage(cid, `📊 *Swarms Activos:*\n${lines.join('\n')}`);
      }
    },
    onRetry: async (cid, id) => {
      try {
        const resetCount = await taskQueue.resetFailedTasks(db, id);
        if (resetCount === 0) {
          await sendMessage(cid, `❌ No hay tareas fallidas en swarm \`${id}\`.`);
          return;
        }
        await sendMessage(cid, `🔄 *Swarm \`#${id}\` retry!* ${resetCount} tareas reseteadas. Re-ejecutando...`);
        executeSwarm(db, id, cid, { simulationMode: isSimulationMode() })
          .catch(e => sendMessage(cid, `❌ Retry error: ${e.message}`));
      } catch (e) {
        await sendMessage(cid, `❌ Error en retry: ${e.message}`);
      }
    },
    onHealth: async (cid) => {
      try {
        const results = await validateAllKeys();
        const lines = ['🔑 *Estado de Cuentas Jules:*', ''];
        for (const [email, result] of Object.entries(results)) {
          const role = ACCOUNT_ROLES[email] || 'Unknown';
          const icon = result.valid ? '✅' : '❌';
          lines.push(`${icon} *${role}*: \`${email}\``);
          if (!result.valid) lines.push(`   └ ${result.reason}`);
        }
        await sendMessage(cid, lines.join('\n'));
      } catch (e) {
        await sendMessage(cid, `❌ Error checking health: ${e.message}`);
      }
    },
    onCicd: async (cid, taskPrompt) => {
      console.log(`[onCicd] Triggered for CID ${cid} with prompt: "${taskPrompt}"`);
      try {
        const accountEmail = 'getxobelaeskola@gmail.com'; // LEAD ORCHESTRATOR
        const apiKey = ACCOUNTS_MAP[accountEmail] || process.env.JULES_API_KEY;

        console.log(`[onCicd] Using account: ${accountEmail}, Key prefix: ${apiKey?.substring(0, 5)}...`);

        await sendMessage(cid, `✅ *Tarea CI/CD creada.*\n_Prompt:_ ${taskPrompt}\n_Agente:_ LEAD ORCHESTRATOR`);
        console.log(`[onCicd] Confirmation message sent to Telegram`);

        // Usar la función helper para construir headers correctos
        const headers = buildAuthHeaders(apiKey);
        console.log(`[onCicd] Headers built:`, JSON.stringify(headers).replace(apiKey, 'REDACTED'));

        console.log(`[onCicd] Sending POST request to Jules API...`);
        axios.post('https://jules.googleapis.com/v1alpha/sessions', {
          prompt: `CI/CD MANUAL TRIGGER: ${taskPrompt}\n\nMISSION: Use LEAD_ORCHESTRATOR identity. Fix issues or implement features as requested, then process it as an Auto-Healing/Auto-Merge task.`,
          sourceContext: {
            source: 'sources/github/ibaitelexfree-creator/getxobelaeskola',
            githubRepoContext: {
              startingBranch: 'main'
            }
          },
          automationMode: 'AUTO_CREATE_PR'
        }, {
          headers
        }).then(response => {
          console.log(`[onCicd] Jules session created: ${response.data.name}`);
          sendMessage(cid, `🚀 Sesión de Jules iniciada para CI/CD: \`${response.data.name}\``).catch(() => { });
        }).catch(err => {
          console.error(`[onCicd] Jules API Error:`, err.response?.data || err.message);
          const errMsg = err.response?.data?.error?.message || err.message;
          sendMessage(cid, `❌ Falló la creación de la sesión Jules: ${errMsg}`).catch(() => { });
        });

      } catch (e) {
        console.error(`[onCicd] Catch Error:`, e.message);
        await sendMessage(cid, `❌ Error en CI/CD: ${e.message}`);
      }
    }
  }).catch(e => console.error('[TelegramBot] Fatal:', e.message));

  // MISSION CONTROL TRAFFIC SIMULATOR
  setInterval(() => {
    const services = ['api', 'auth', 'db', 'fleet', 'payments'];
    const routes = ['/api/v1/status', '/api/v1/login', '/api/v1/data', '/api/v1/boats', '/api/v1/checkout'];

    services.forEach((svc, idx) => {
      // Metrics collection for phantom traffic
      if (metrics.phantomTrafficCounter) {
        metrics.phantomTrafficCounter.inc({ service: svc });
      }

      const rand = Math.random();
      let status = 200;
      let latency = Math.random() * 0.15 + 0.02;

      // Generate "Common" Errors as requested
      if (rand > 0.99) {
        status = 500; // Internal Error
        latency = 2.0 + Math.random();
      } else if (rand > 0.97) {
        status = 504; // Gateway Timeout
        latency = 5.0;
      } else if (rand > 0.95) {
        status = 401; // Unauthorized
      } else if (rand > 0.93) {
        status = 429; // Rate Limited
      } else if (rand > 0.90) {
        status = 404; // Not Found
      }

      if (metrics.httpRequestDuration) {
        metrics.httpRequestDuration.observe(
          { method: 'GET', route: routes[idx] || '/api/v1/resource', status_code: status },
          latency
        );
      }
    });
  }, 2000);
});
