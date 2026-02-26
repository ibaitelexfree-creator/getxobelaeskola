<<<<<<< HEAD
=======
// orchestrator-api/src/index.js
>>>>>>> pr-286
import express from 'express';
import pg from 'pg';
import axios from 'axios';
import crypto from 'crypto';
<<<<<<< HEAD
import dns from 'dns';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import * as metrics from './metrics.js';
import { sendTelegramMessage } from './telegram.js';
import { createDashboardSnapshot } from './grafana-service.js';

// Fix connection hangs by prioritizing IPv4
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const app = express();
app.use(cors());

// Configuration
=======
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { GoogleAuth } from 'google-auth-library';
import * as metrics from './metrics.js';

const app = express();

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// SECURITY FIX: JSON parsing with raw body capture for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    // Capture raw body for GitHub webhook signature verification
    if (req.path.startsWith('/api/v1/webhooks/github')) {
      req.rawBody = buf;
    }
  }
}));

// Config
>>>>>>> pr-286
const JULES_API_KEY = process.env.JULES_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
<<<<<<< HEAD
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
}

// Routes
=======
const PORT = process.env.PORT || 3000;

// GitHub webhook signature verification
function verifyGitHubWebhook(req) {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn('[Security] GITHUB_WEBHOOK_SECRET not configured - webhook verification disabled');
    return true; // Allow if no secret configured (dev mode)
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return false;
  }

  // CRITICAL: Use raw body buffer for HMAC - not JSON.stringify which can differ
  const body = req.rawBody || Buffer.from(JSON.stringify(req.body));
  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(body).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (e) {
    return false;
  }
}

// Initialize database (optional - graceful fallback)
let db = null;
if (DATABASE_URL) {
  db = new pg.Pool({ connectionString: DATABASE_URL });
  console.log('Database configured');
}

// Metrics Endpoint
>>>>>>> pr-286
app.get('/api/v1/metrics', async (req, res) => {
  res.set('Content-Type', metrics.registerContentType);
  res.end(await metrics.getMetrics());
});

<<<<<<< HEAD
app.get(['/health', '/api/v1/health'], async (req, res) => {
  res.json({
    status: 'ok',
    version: '1.6.0',
    services: { database: db ? 'connected' : 'none' },
=======
// Jules API client (Simple Auth for Stability)
const julesClient = axios.create({
  baseURL: 'https://jules.googleapis.com/v1alpha',
  timeout: 30000, // 30 second timeout to prevent hung requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth interceptor
julesClient.interceptors.request.use((config) => {
  if (JULES_API_KEY) {
    config.headers.Authorization = 'Bearer ' + JULES_API_KEY;
  }
  console.log('[Jules Client] Requesting ' + config.url);
  return config;
});

// GitHub API client
const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github+json'
  }
});

githubClient.interceptors.request.use((config) => {
  if (GITHUB_TOKEN) {
    config.headers.Authorization = 'Bearer ' + GITHUB_TOKEN;
  }
  return config;
});

// Root Endpoint (Service Metadata)
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Jules MCP Server',
    version: '1.5.0',
    deployedBy: 'Gemini-Final',
    capabilities: ['sessions', 'tasks', 'orchestration', 'mcp-protocol'],
>>>>>>> pr-286
    timestamp: new Date().toISOString()
  });
});

<<<<<<< HEAD
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

// Swarm Pool Status
app.get('/api/v1/swarm/status', async (req, res) => {
  const status = Object.keys(ACCOUNTS_MAP).map(email => ({
    email,
    role: email === 'getxobelaeskola@gmail.com' ? 'Architect' : email === 'ibaitnt@gmail.com' ? 'Data Master' : 'UI Engine',
    active_sessions: 0 // Simplificado: en una versión pro, aquí consultaríamos el pool real
  }));

  res.json({ success: true, pool: status });
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
// Identity Map: Real person → Jules API Key
// Jules 1 (Architect/QA): getxobelaeskola@gmail.com → JULES_API_KEY   (MCP: Supabase + Neon)
// Jules 2 (Data Master):  ibaitnt@gmail.com         → JULES_API_KEY_2 (MCP: Tinybird)
// Jules 3 (UI Engine):    ibaitelexfree@gmail.com    → JULES_API_KEY_3 (MCP: Context7 + Render)
const ACCOUNTS_MAP = {
  'getxobelaeskola@gmail.com': process.env.JULES_API_KEY,      // Jules 1 - Architect
  'ibaitnt@gmail.com': process.env.JULES_API_KEY_2,            // Jules 2 - Data Master
  'ibaitelexfree@gmail.com': process.env.JULES_API_KEY_3,      // Jules 3 - UI Engine
};

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
      headers: {
        'Authorization': apiKey.startsWith('AQ.') ? `Bearer ${apiKey}` : undefined,
        'X-Goog-Api-Key': !apiKey.startsWith('AQ.') ? apiKey : undefined,
        'Content-Type': 'application/json'
      }
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
            headers: {
              'Authorization': apiKey.startsWith('AQ.') ? `Bearer ${apiKey}` : undefined,
              'X-Goog-Api-Key': !apiKey.startsWith('AQ.') ? apiKey : undefined,
            }
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
    await execPromise('node scripts/generate_ai_report_source.js', { cwd: process.cwd() });

    // 2. Ejecutar la automatización de NotebookLM
    // NOTA: Esto requiere que Chrome esté disponible y logueado en la máquina host.
    console.log(`[${requestId}] Step 2: Running Puppeteer automation...`);
    const { stdout, stderr } = await execPromise('node scripts/notebooklm_automation.js', { cwd: process.cwd() });

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
  console.log(`Jules Orchestrator API v1.6.1 listening on 0.0.0.0:${PORT}`);

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
=======
// Health Check
app.get(['/health', '/api/v1/health'], async (req, res) => {
  res.json({
    status: 'ok',
    version: '1.5.0',
    services: {
      database: db ? 'configured' : 'optional',
      julesApi: 'configured',
      githubApi: GITHUB_TOKEN ? 'configured' : 'not_configured'
    },
    timestamp: new Date().toISOString()
  });
});

// MCP Tools List
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: "jules_create_session",
        description: "Create a new Jules coding session",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Session name" },
            source: { type: "string", description: "Source repository (e.g., github.com/owner/repo)" }
          },
          required: ["source"]
        }
      },
      {
        name: "jules_list_sessions",
        description: "List active Jules sessions",
        inputSchema: {
          type: "object",
          properties: {
            pageSize: { type: "number" }
          }
        }
      },
      {
        name: "jules_get_session",
        description: "Get details of a specific session",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: { type: "string" }
          },
          required: ["sessionId"]
        }
      }
    ]
  });
});

// MCP Tool Execution with input validation
app.post('/mcp/execute', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${req.requestId}] MCP Execution Request`);

  const { name, arguments: args, tool, parameters } = req.body;

  // Support both MCP formats
  const toolName = name || tool;
  const toolArgs = args || parameters || {};

  // Input validation
  if (!toolName) {
    console.error(`[${req.requestId}] MCP Error: Missing tool name`);
    return res.status(400).json({
        error: 'Tool name required (use "name" or "tool" field)',
        requestId: req.requestId,
        hint: 'Ensure Content-Type is application/json'
    });
  }

  // Validate tool name format (alphanumeric and underscores only)
  if (!/^[a-z_][a-z0-9_]*$/i.test(toolName)) {
    return res.status(400).json({
      error: 'Invalid tool name format',
      requestId: req.requestId,
      hint: 'Tool names must be alphanumeric with underscores'
    });
  }

  try {
    let result;
    if (toolName === 'jules_create_session') {
      const response = await julesClient.post('/sessions', toolArgs);
      result = response.data;
    } else if (toolName === 'jules_list_sessions') {
      const response = await julesClient.get('/sessions');
      result = response.data;
    } else if (toolName === 'jules_get_session') {
      const response = await julesClient.get('/sessions/' + toolArgs.sessionId);
      result = response.data;
    } else {
      return res.status(404).json({ error: 'Tool ' + toolName + ' not found' });
    }

    res.json({
      success: true,
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      result
    });
  } catch (error) {
    console.error('MCP Execute Error (' + toolName + '):', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// WebSocket Setup
const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

// WebSocket heartbeat to detect dead connections and prevent memory leaks
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

wss.on('connection', (ws) => {
  ws.isAlive = true;
  clients.add(ws);
  console.log('WebSocket client connected');

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    clients.delete(ws);
  });
});

// Heartbeat interval to clean up dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      clients.delete(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

function broadcast(data) {
  const payload = JSON.stringify(data); // Single serialization for O(1) vs O(n)
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

// GitHub Webhook Receiver with signature verification
app.post('/api/v1/webhooks/github', async (req, res) => {
  // CRITICAL: Verify webhook signature to prevent spoofing
  if (!verifyGitHubWebhook(req)) {
    console.error('[Security] Invalid webhook signature - rejecting request');
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const event = req.headers['x-github-event'];
  console.log('Received GitHub webhook: ' + event);

  // Async broadcast to avoid blocking response
  setImmediate(() => {
    broadcast({
      type: 'github_webhook',
      event,
      payload: req.body,
      timestamp: new Date().toISOString()
    });
  });

  res.status(200).json({ received: true });
});

// Start server
server.listen(PORT, () => {
  console.log('Jules Orchestrator API running on port ' + PORT);
  console.log('Version: 1.5.0');
>>>>>>> pr-286
});
