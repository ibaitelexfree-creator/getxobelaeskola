import 'dotenv/config';
<<<<<<< HEAD
console.log('--- STARTING ORCHESTRATOR API v2.0.1 (DEBUG ENABLED) ---'); // Hardened Production Ready 🛡️
=======
console.log('--- STARTING ORCHESTRATOR API v2.0.1 (DEBUG ENABLED) ---');
>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
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
<<<<<<< HEAD
import { startSwarmV2 } from './lib/swarm-orchestrator-v2.js';
import pool, { query } from './lib/db-client.js';
import { runSwarmWatchdog } from './lib/swarm-watchdog.js';
import { generateDailyReport } from './lib/daily-report.js';
import { RateGuard } from './lib/rate-guard.js';
import { startNodeHealthMonitor, getHealthStats } from './lib/node-health.js';

import { recordMissionMetrics, getTierReport } from './lib/operational-monitor.js';
import { getDegradedLogStats } from './lib/auditor-client.js';

import { setPaused, getPaused } from './lib/db-client.js';

startNodeHealthMonitor();

import { startCanary, getCanaryStatus } from './lib/canary-controller.js';
import { captureIntegritySnapshot } from './lib/integrity-snapshot.js';
=======
>>>>>>> origin/jules/fix-lint-errors-17071256425989174302

// Fix connection hangs by prioritizing IPv4
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Scheduled Integrity Snapshots (e.g. Daily at midnight, but simulated on start for testing)
setTimeout(() => captureIntegritySnapshot(), 5000);
// and run it 1/day
setInterval(() => captureIntegritySnapshot(), 86400000);

const app = express();
app.use(cors());

// Configuration
const JULES_API_KEY = process.env.JULES_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Added GROQ_API_KEY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;

// Request ID middleware, Metrics, and Rate Limiting
app.use(async (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);

  // Rate Guard by Origin (Smart Rate Limiting)
  if (req.method === 'POST') {
    const originIp = req.ip || req.headers['x-forwarded-for'] || 'unknown_origin';
    const rateRes = await RateGuard.handleOriginRequest(originIp, 500); // Max 500 posts/day/IP
    if (!rateRes.allowed) {
      return res.status(429).json({ error: 'Origin daily limit exceeded' });
    }
  }

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
// Static files for Control Room
app.use(express.static('public'));

// Initialize database
let db = null;
if (DATABASE_URL) {
<<<<<<< HEAD
  db = pool;
  console.log('[Init] Unified database pool connected');
=======
  db = new pg.Pool({ connectionString: DATABASE_URL });
  console.log('[Init] Database pool created');
>>>>>>> origin/jules/fix-lint-errors-17071256425989174302

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

app.get(['/health', '/api/health', '/api/v1/health'], async (req, res) => {
  res.json({
    status: 'ok',
    version: '1.6.1',
    services: { database: db ? (getPaused() ? 'degraded_simulated' : 'connected') : 'none' },
    timestamp: new Date().toISOString()
  });
});


app.get('/api/v2/system/operations', (req, res) => {
  res.json({
    operational: {},
    degradedStats: getDegradedLogStats(),
    health: getHealthStats(),
    tiers: getTierReport()
  });
});


app.post('/api/v2/system/chaos/db-outage', (req, res) => {
  const { durationMs = 120000 } = req.body;
  if (durationMs > 0) {
    setPaused(true);
    setTimeout(() => {
      setPaused(false);
      console.log('[Chaos] Database connection restored automatically.');
    }, durationMs);
  } else {
    setPaused(false);
    console.log('[Chaos] Database connection restored manually.');
  }
  res.json({ status: 'chaos_active', type: 'db_outage', durationMs });
});

app.post('/api/v2/system/chaos/force-drift', async (req, res) => {
  const { samples = 10, score = 2 } = req.body;
  for (let i = 0; i < samples; i++) {
    recordMissionMetrics(100, 0.001, score);
    // Optional: Insert into DB if pool is available to trigger real auditor drift logic
    if (db && !getPaused()) {
      await db.query('INSERT INTO sw2_audit_results (audit_score, original_prompt, synthesized_output) VALUES ($1, $2, $3)', [score, 'Chaos Test Prompt', 'Chaos Test Output']);
    }
  }

  // Trigger metrics calculation to fire alerts
  const { updateAndPersistMetrics } = await import('./lib/auditor-client.js');
  if (db && !getPaused()) {
    await updateAndPersistMetrics(0);
  }

  res.json({ status: 'chaos_active', type: 'model_drift', samples, score });
});

app.post('/api/v2/system/chaos/test-audit', async (req, res) => {
  const { score = 8 } = req.body;
  const { persistAudit } = await import('./lib/auditor-client.js');

  const auditId = await persistAudit({
    originalPrompt: 'Chaos Test Persist',
    synthesizedOutput: 'Chaos Test Output',
    audit: { score, recommendation: 'PROCEED', security_check: 'PASS' },
    swarmId: crypto.randomUUID(),
    taskId: 1,
    latencyMs: 100
  });

  res.json({ status: 'audit_triggered', auditId });
});

app.post('/api/v2/system/canary/activate', (req, res) => {
  startCanary();
  res.json({ status: 'canary_activated', config: getCanaryStatus() });
});

app.get('/api/v2/system/canary/status', (req, res) => {
  res.json(getCanaryStatus());
});

app.get('/api/v2/system/canary/stats', (req, res) => {
  // Manual trigger of the statistical report logic for the response
  const report = getOperationalReport();
  const status = getCanaryStatus();
  res.json({
    auditScore: {
      movingAvg: status.metricsBuffer.slice(-12).reduce((a, b) => a + (b.auditScore || 0), 0) / (status.metricsBuffer.slice(-12).length || 1),
      stdDev: status.metricsBuffer.length > 0 ? Math.sqrt(status.metricsBuffer.slice(-12).map(m => Math.pow((m.auditScore || 0) - (status.metricsBuffer.slice(-12).reduce((a, b) => a + (b.auditScore || 0), 0) / (status.metricsBuffer.slice(-12).length || 1)), 2)).reduce((a, b) => a + b, 0) / (status.metricsBuffer.slice(-12).length || 1)) : 0
    },
    heap: {
      current: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1) + ' MB',
      bufferSize: status.metricsBuffer.length
    },
    burnRate: {
      realTPM: report.burnRate.tokensPerMin,
      baselineTPM: status.baseline.tokensPerMin,
      variance: status.baseline.tokensPerMin > 0 ? ((report.burnRate.tokensPerMin / status.baseline.tokensPerMin) - 1) * 100 : 0
    },
    quality: {
      totalJobs: status.stats.totalJobs,
      totalReplays: status.stats.totalReplays,
      replayRatio: status.replayRatio
    }
  });
});

// Dashboard: List all workflows/swarms
app.get('/api/v1/workflows', async (req, res) => {
  try {
    if (!db) {
      return res.json([]); // Return empty list if no DB
    }

    // Fetch all proposals
    const proposalsRes = await db.query('SELECT * FROM swarm_proposals ORDER BY created_at DESC LIMIT 50');
    const proposals = proposalsRes.rows;

    // Enrich with progress
    const enriched = await Promise.all(proposals.map(async (p) => {
      const progress = await taskQueue.getSwarmProgress(db, p.id);
      const tasks = await taskQueue.getSwarmTasks(db, p.id);

      return {
        id: p.id,
        name: p.original_prompt.substring(0, 50) + (p.original_prompt.length > 50 ? '...' : ''),
        status: p.status,
        created_at: p.created_at,
        progress: progress,
        tasks: tasks
      };
    }));

    res.json(enriched);
  } catch (e) {
    console.error('[Workflows API] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// SWARM 2.0 Specialized CI/CD Pipeline
app.post('/api/v2/swarm', async (req, res) => {
  const { prompt, name } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  try {
    startSwarmV2(prompt, name || 'Auto Swarm 2.0')
      .catch(err => console.error('[API] SwarmV2 Bg Error:', err.message));
    res.status(202).json({
      message: 'Swarm 2.0 accepted and running in background',
      system: 'SWARM-CICD-2.0'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Swarm 2.0 Audit History
app.get('/api/v2/swarms', async (req, res) => {
  try {
    if (!db) return res.json([]);
    const swarms = await db.query('SELECT * FROM sw2_swarms ORDER BY created_at DESC LIMIT 50');
    res.json(swarms.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v2/swarms/:id', async (req, res) => {
  try {
    if (!db) return res.status(404).json({ error: 'DB not available' });
    const swarm = await db.query('SELECT * FROM sw2_swarms WHERE id = $1', [req.params.id]);
    if (swarm.rows.length === 0) return res.status(404).json({ error: 'Swarm not found' });

    const tasks = await db.query('SELECT * FROM sw2_tasks WHERE swarm_id = $1 ORDER BY id ASC', [req.params.id]);
    const history = await db.query('SELECT * FROM sw2_history WHERE swarm_id = $1 ORDER BY created_at DESC', [req.params.id]);
    const audits = await db.query('SELECT * FROM sw2_audit_results WHERE swarm_id = $1 ORDER BY created_at DESC', [req.params.id]);
    const feedback = await db.query('SELECT * FROM sw2_agent_feedback WHERE swarm_id = $1 ORDER BY created_at DESC', [req.params.id]);

    res.json({
      ...swarm.rows[0],
      tasks: tasks.rows,
      history: history.rows,
      audits: audits.rows,
      feedback: feedback.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Replay a swarm deterministically
app.post('/api/v2/swarms/:id/replay', async (req, res) => {
  try {
    if (!db) return res.status(404).json({ error: 'DB not available' });
    const swarmRes = await db.query('SELECT name, metadata FROM sw2_swarms WHERE id = $1', [req.params.id]);
    if (swarmRes.rows.length === 0) return res.status(404).json({ error: 'Swarm not found' });

    const { name, metadata } = swarmRes.rows[0];
    const originalPrompt = metadata.original_prompt || 'Replay Prompt';

    // Inject marker to show it is a replay
    const replayName = `${name} (Replay of ${req.params.id.substring(0, 6)})`;

    startSwarmV2(originalPrompt, replayName)
      .catch(err => console.error('[API] SwarmV2 Replay Bg Error:', err.message));

    res.status(202).json({
      message: 'Swarm replay accepted and running in background',
      original_swarm_id: req.params.id,
      prompt: originalPrompt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Observability & Governance Endpoints ---

// 1. Health of Pipeline
app.get('/api/v2/system/health', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ status: 'No DB' });

    // Baseline (First 50 audits)
    const baseRes = await db.query('SELECT COALESCE(AVG(audit_score), 0) as baseline FROM (SELECT audit_score FROM sw2_audit_results ORDER BY created_at ASC LIMIT 50) sub');
    const baseline = parseFloat(baseRes.rows[0].baseline);

    // Current moving average
    const curRes = await db.query('SELECT COALESCE(AVG(audit_score), 0) as cur_avg FROM (SELECT audit_score FROM sw2_audit_results ORDER BY created_at DESC LIMIT 20) sub');
    const current = parseFloat(curRes.rows[0].cur_avg);

    let drift = 0;
    let state = '🟢 Stable';
    if (baseline > 0) {
      drift = ((current - baseline) / baseline) * 100;
      if (drift < -15) state = '🔴 Drift Detected';
      else if (drift < -5) state = '🟡 Degrading';
    }

    const nodeHealth = getHealthStats();

    res.json({
      status: state,
      moving_average: current.toFixed(2),
      baseline: baseline.toFixed(2),
      drift_pct: drift.toFixed(2),
      node: nodeHealth
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Manual Integrity Check
app.post('/api/v2/system/integrity/check', async (req, res) => {
  try {
    const result = await captureIntegritySnapshot();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Cost Governance & Metrics
app.get('/api/v2/metrics', async (req, res) => {
  try {
    if (!db) return res.json({});
    // Cost gov
    const costRes = await db.query('SELECT total_cost_usd, daily_limit_usd, kill_switch_active FROM sw2_cost_governance WHERE date = CURRENT_DATE');
    const cost = costRes.rows[0] || { total_cost_usd: 0, daily_limit_usd: 5, kill_switch_active: false };

    // Architect fast fail rate (Assuming architect fails are RETRYs on architecture tasks, or generally early RETRYs. We can proxy this for now with block_rate_pct or general failures)
    const metricsRes = await db.query('SELECT * FROM sw2_audit_metrics ORDER BY timestamp DESC LIMIT 1');
    const latestMetrics = metricsRes.rows[0] || {};

    // Proxy for architect fail rate: simply calculate percentage of recent tasks that failed
    const archRes = await db.query(`
      SELECT 
        COUNT(*) as total, 
        SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END) as fails 
      FROM sw2_tasks 
      WHERE agent_role='ARCHITECT' AND created_at >= NOW() - INTERVAL '24 HOURS'
    `);
    const archTotal = parseInt(archRes.rows[0].total) || 1;
    const archFails = parseInt(archRes.rows[0].fails) || 0;
    const archFailRate = ((archFails / archTotal) * 100).toFixed(2);

    res.json({
      cost_today_usd: parseFloat(cost.total_cost_usd).toFixed(4),
      daily_limit_usd: parseFloat(cost.daily_limit_usd).toFixed(4),
      percent_consumed: ((parseFloat(cost.total_cost_usd) / parseFloat(cost.daily_limit_usd)) * 100).toFixed(2),
      kill_switch_active: cost.kill_switch_active,
      architect_fast_fail_rate_pct: archFailRate,
      block_rate_pct: latestMetrics.block_rate_pct,
      human_review_rate_pct: latestMetrics.human_review_rate_pct
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Executions RT
app.get('/api/v2/executions/realtime', async (req, res) => {
  try {
    if (!db) return res.json([]);
    const execs = await db.query(`
      SELECT 
        correlation_id, 
        swarm_id,
        recommendation as status, 
        audit_score, 
        security_check as tamper, 
        threshold_policy_version as policy_version, 
        cost_usd as cost_estimate 
      FROM sw2_audit_results 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    res.json(execs.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quality Auditor Feedback & Stats
app.post('/api/v1/feedback', async (req, res) => {
  const {
    auditId, feedbackType, blamedAgent, blamedAgentNumber,
    blameReason, userComment
  } = req.body;

  if (!auditId || !feedbackType) {
    return res.status(400).json({ error: 'auditId and feedbackType required' });
  }

  try {
    let rcaResult = null;
    let qdrantPointId = null;

    if (feedbackType === 'negative') {
      const { analyzeWithRcaEngine } = await import('./lib/rca-engine.js');
      rcaResult = await analyzeWithRcaEngine(
        blameReason || 'User flagged as negative',
        `AuditID: ${auditId}, Blamed Agent: ${blamedAgent || 'unknown'}`,
        'FEEDBACK_API',
        null
      );
    }

    const { recordFeedback } = await import('./lib/auditor-client.js');
    const feedbackId = await recordFeedback({
      auditId, feedbackType, blamedAgent, blamedAgentNumber,
      blameReason, rcaResult, qdrantPointId, userComment
    });

    res.json({ success: true, feedbackId });
  } catch (error) {
    console.error('Feedback API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/audit-stats', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB not connected' });

    const stats = await db.query(`
            SELECT
                COUNT(*) as total_audits,
                AVG(audit_score) as avg_score,
                COUNT(*) FILTER (WHERE security_check = 'FAIL') as security_fails,
                COUNT(*) FILTER (WHERE qdrant_conflict = true) as qdrant_conflicts,
                COUNT(*) FILTER (WHERE recommendation = 'MERGE') as merges,
                COUNT(*) FILTER (WHERE recommendation = 'RETRY') as retries,
                COUNT(*) FILTER (WHERE recommendation = 'HUMAN_REVIEW') as human_reviews
            FROM sw2_audit_results
            WHERE created_at >= NOW() - INTERVAL '30 days'
        `);

    const feedback = await db.query(`
            SELECT
                blamed_agent_number,
                blamed_agent,
                COUNT(*) as blame_count
            FROM sw2_agent_feedback
            WHERE feedback_type = 'negative'
              AND blamed_agent_number IS NOT NULL
              AND created_at >= NOW() - INTERVAL '90 days'
            GROUP BY blamed_agent_number, blamed_agent
            ORDER BY blame_count DESC
        `);

    res.json({
      stats: stats.rows[0],
      weakest_agents: feedback.rows
    });
  } catch (error) {
    console.error('Audit Stats API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard: Rate Limit Metrics
app.get('/api/rate-limit/metrics', async (req, res) => {
  try {
    const stats = await RateGuard.getStats();

    // Fetch recent logs from DB
    const recentLogs = await db.query(
      'SELECT model_name, provider, status_code, created_at FROM sw2_rate_limits ORDER BY created_at DESC LIMIT 20'
    );

    res.json({
      success: true,
      stats,
      logs: recentLogs.rows
    });
  } catch (e) {
    console.error('[Metrics] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

import { runChaosExperiment } from './lib/chaos-engine.js';

// Chaos Engineering Endpoints (V2)
app.post('/api/v2/chaos/run', async (req, res) => {
  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'Chaos type is required' });

  try {
    const result = await runChaosExperiment(type);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
<<<<<<< HEAD
=======
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
>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
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
    onSwarm2: async (cid, prompt) => {
      console.log(`[onSwarm2] Swarm 2.0 Triggered for CID ${cid} with prompt: "${prompt}"`);
      try {
        await startSwarmV2(prompt, 'Telegram Swarm 2.0');
      } catch (e) {
        console.error(`[onSwarm2] Error:`, e.message);
        await sendMessage(cid, `❌ Error en Swarm 2.0: ${e.message}`);
      }
    },
    onCicd: async (cid, taskPrompt) => {
      console.log(`[onCicd] CI/CD Swarm Triggered for CID ${cid} with prompt: "${taskPrompt}"`);
      try {
        await sendMessage(cid, `⚙️ *Iniciando Proceso CI/CD de Alto Nivel...*\nAnalizando arquitectura y flujo de relay (Architect → Data → UI)...`);

<<<<<<< HEAD
        // 1. Analizar con Groq para obtener el plan de múltiples agentes
        const analysis = await analyzeTask(taskPrompt, 3); // Forzar 3 roles base

        // 2. Crear propuesta persistente
        const proposalId = await taskQueue.createProposal(db, {
          chatId: cid,
          prompt: taskPrompt,
          maxJules: 3,
          analysis
=======
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
>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
        });

        // 3. Auto-aprobar y ejecutar el swarm
        const result = await taskQueue.approveProposal(db, proposalId);
        if (!result) throw new Error('Failed to approve proposal for CI/CD');

        await sendMessage(cid, `🚀 *CI/CD Swarm \`#${proposalId}\` aprobado automáticamente.*
Fases: Architect (Design) → Data (Backend) → UI (Frontend)
${result.taskCount} tareas en cola.`);

        // 4. Ejecutar el orquestador de swarm
        executeSwarm(db, proposalId, cid, { simulationMode: isSimulationMode() })
          .catch(e => sendMessage(cid, `❌ Error de ejecución en Swarm CI/CD: ${e.message}`));

      } catch (e) {
<<<<<<< HEAD
        console.error(`[onCicd] Swarm Error:`, e.message);
        await sendMessage(cid, `❌ Error al iniciar Swarm CI/CD: ${e.message}`);
=======
        console.error(`[onCicd] Catch Error:`, e.message);
        await sendMessage(cid, `❌ Error en CI/CD: ${e.message}`);
>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
      }
    }
  }).catch(e => console.error('[TelegramBot] Fatal:', e.message));

  // Resume any running tasks
  resumeActiveTasks(db).catch(e => console.error('[Init] Resume failed:', e.message));

  // Initialize Periodic Tasks
  console.log('[Init] Starting Swarm Watchdog (15m interval)...');
  setInterval(runSwarmWatchdog, 15 * 60 * 1000);

  console.log('[Init] Starting Daily Report Checker (1h interval)...');
  setInterval(async () => {
    const now = new Date();
    // Trigger report at 8:00 AM (UTC preferably, but local for now)
    if (now.getHours() === 8 && now.getMinutes() === 0) {
      await generateDailyReport();
    }
  }, 60 * 1000);

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

// Global Error Handlers for Telegram Alerts
process.on('uncaughtException', async (err) => {
  console.error('[Fatal] Uncaught Exception:', err);
  await sendTelegramMessage(`💀 *CRASH: Uncaught Exception*\n\`\`\`\n${err.stack || err.message}\n\`\`\``);
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('[Fatal] Unhandled Rejection at:', promise, 'reason:', reason);
  await sendTelegramMessage(`⚠️ *ALERTA: Unhandled Rejection*\n${reason}`);
});
