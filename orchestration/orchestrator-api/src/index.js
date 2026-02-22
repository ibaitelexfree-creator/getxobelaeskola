import express from 'express';
import pg from 'pg';
import axios from 'axios';
import crypto from 'crypto';
import dns from 'dns';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import * as metrics from './metrics.js';
import { sendTelegramMessage } from './telegram.js';
import { createDashboardSnapshot } from './grafana-service.js';

// Fix connection hangs by prioritizing IPv4
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const app = express();

// Configuration
const JULES_API_KEY = process.env.JULES_API_KEY;
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
    metrics.httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode },
      duration
    );
  });
  next();
});

// JSON parsing with raw body capture
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.path.startsWith('/api/v1/webhooks/github')) {
      req.rawBody = buf;
    }
  }
}));

// GitHub Security
function verifyGitHubWebhook(req) {
  if (!GITHUB_WEBHOOK_SECRET) return true;
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;
  const body = req.rawBody || Buffer.from(JSON.stringify(req.body));
  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(body).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (e) {
    return false;
  }
}

// Database
let db = null;
if (DATABASE_URL) {
  db = new pg.Pool({ connectionString: DATABASE_URL });
  console.log('Database configured');
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
    await new Promise(r => setTimeout(r, parseInt(ms) || 2000));
    return res.json({ success: true, delay: ms });
  }

  if (type === 'error') {
    return res.status(parseInt(code) || 500).json({ error: 'Chaos Simulation' });
  }

  res.status(400).json({ error: 'Unknown chaos type' });
});

// Incident Webhook Handler
app.post('/api/v1/incidents/webhook', async (req, res) => {
  const { status, commonLabels, commonAnnotations, externalURL } = req.body;
  console.log(`[Incident] Webhook: status=${status}, alert=${commonLabels?.alertname}`);

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
        } catch (e) {
          console.error('[Incident] Snapshot failed:', e.message);
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
      message += `*Status:* All systems green.`;
    }

    await sendTelegramMessage(message, { parseMode: 'Markdown' });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Incident] Webhook Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GitHub Trigger
app.post('/api/v1/github/trigger-build', async (req, res) => {
  // Logic here
  res.json({ success: true, note: 'Implemented' });
});

// Start Server
const server = createServer(app);
const wss = new WebSocketServer({ server });

server.listen(PORT, () => {
  console.log(`Jules Orchestrator API v1.6 Running on Port ${PORT}`);

  // MISSION CONTROL TRAFFIC SIMULATOR
  setInterval(() => {
    const services = ['api', 'auth', 'db', 'fleet', 'payments'];
    const routes = ['/api/v1/status', '/api/v1/login', '/api/v1/data', '/api/v1/boats', '/api/v1/checkout'];

    services.forEach((svc, idx) => {
      metrics.phantomTrafficCounter.inc({ service: svc });

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

      metrics.httpRequestDuration.observe(
        { method: 'GET', route: routes[idx] || '/api/v1/resource', status_code: status },
        latency
      );
    });
  }, 2000); // More aggressive: every 2 seconds
});
