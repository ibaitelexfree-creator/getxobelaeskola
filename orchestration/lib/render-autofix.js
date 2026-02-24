/**
 * Render Auto-Fix Module
 * Automatically fixes build failures on Jules PRs
 *
 * Flow:
 * 1. Webhook receives build failure event from Render
 * 2. Check if branch is a Jules PR branch
 * 3. Fetch and analyze build logs
 * 4. Send error context to Jules session
 * 5. Jules pushes fix to same branch
 * 6. Render automatically rebuilds
 */

import crypto from 'crypto';
import {
  isConfigured,
  getBuildLogs,
  getLatestFailedDeploy,
  isJulesBranch,
  analyzeErrors,
  getWebhookSecret,
  listServices
} from './render-client.js';
import { sendTelegramMessage } from './telegram.js';
import { getPrByBranch } from './github.js';
import { writeProjectMemory } from './project-memory.js';

// Track active auto-fix operations to prevent duplicates
const activeAutoFixes = new Map();
const MAX_ACTIVE_AUTOFIXES = 10;
const AUTOFIX_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Replay attack prevention - track processed webhook IDs
const processedWebhooks = new Map();
const WEBHOOK_DEDUP_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_WEBHOOK_TIMESTAMP_DRIFT = 5 * 60 * 1000; // 5 minutes

// Settings storage (in-memory, persisted via MCP tools)
let autoFixEnabled = true;
const monitoredServices = new Set();

// Session Reuse Policy Constants
const REUSABLE_STATES = ['PLANNING', 'EXECUTING'];

/**
 * Clean up old processed webhook entries to prevent memory leak
 */
function cleanupProcessedWebhooks() {
  const cutoff = Date.now() - WEBHOOK_DEDUP_WINDOW;
  for (const [id, timestamp] of processedWebhooks) {
    if (timestamp < cutoff) {
      processedWebhooks.delete(id);
    }
  }
}

// Cleanup interval reference (started on first webhook or manually)
let cleanupIntervalId = null;

/**
 * Start the cleanup interval (call this when server starts)
 */
export function startCleanupInterval() {
  if (!cleanupIntervalId) {
    cleanupIntervalId = setInterval(cleanupProcessedWebhooks, 5 * 60 * 1000);
    // Unref to allow process to exit naturally in tests
    if (cleanupIntervalId.unref) {
      cleanupIntervalId.unref();
    }
  }
}

/**
 * Stop the cleanup interval (for testing)
 */
export function stopCleanupInterval() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

/**
 * Verify Render webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Render-Signature header
 */
export function verifyWebhookSignature(payload, signature) {
  const secret = getWebhookSecret();

  if (!secret) {
    // No secret configured, skip verification (not recommended for production)
    console.warn('[Render Webhook] No webhook secret configured - skipping signature verification');
    return true;
  }

  if (!signature) {
    console.error('[Render Webhook] Missing signature header');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const providedSignature = signature.replace('sha256=', '');

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Parse Render webhook payload
 * @param {object} body - Webhook request body
 */
export function parseWebhookEvent(body) {
  // Render webhook payload structure
  const { type, data } = body;

  if (type !== 'deploy') {
    return { isRelevant: false, reason: 'Not a deploy event' };
  }

  const deploy = data;

  // Check if this is a build failure
  if (deploy.status !== 'build_failed' && deploy.status !== 'deploy_failed') {
    return { isRelevant: false, reason: `Deploy status is ${deploy.status}, not a failure` };
  }

  // Extract branch info
  const branch = deploy.commit?.branch || deploy.branch;

  if (!branch) {
    return { isRelevant: false, reason: 'No branch info in deploy' };
  }

  // Check if this is a success
  if (deploy.status === 'live') {
    return {
      isRelevant: true,
      event: {
        type: 'deploy_success',
        serviceId: deploy.serviceId || data.serviceId,
        deployId: deploy.id,
        branch,
        url: deploy.url,
        commit: deploy.commit,
        status: deploy.status,
        timestamp: deploy.createdAt || new Date().toISOString()
      }
    };
  }

  // Check if this is a build failure
  if (deploy.status !== 'build_failed' && deploy.status !== 'deploy_failed') {
    return { isRelevant: false, reason: `Deploy status is ${deploy.status}, not a failure or success we track` };
  }

  // Check if this is a Jules branch
  if (!isJulesBranch(branch)) {
    return { isRelevant: false, reason: `Branch "${branch}" is not a Jules PR branch` };
  }

  return {
    isRelevant: true,
    event: {
      type: 'build_failure',
      serviceId: deploy.serviceId || data.serviceId,
      deployId: deploy.id,
      branch,
      commit: deploy.commit,
      status: deploy.status,
      timestamp: deploy.createdAt || new Date().toISOString()
    }
  };
}

/**
 * Check if auto-fix should be triggered
 * @param {object} event - Parsed webhook event
 */
export function shouldAutoFix(event) {
  if (!autoFixEnabled) {
    return { shouldFix: false, reason: 'Auto-fix is disabled' };
  }

  if (!isConfigured()) {
    return { shouldFix: false, reason: 'Render integration not configured' };
  }

  // Check if service is monitored (if specific services are configured)
  if (monitoredServices.size > 0 && !monitoredServices.has(event.serviceId)) {
    return { shouldFix: false, reason: 'Service is not in monitored list' };
  }

  // Check if we're already fixing this deploy
  const fixKey = `${event.serviceId}:${event.deployId}`;
  if (activeAutoFixes.has(fixKey)) {
    return { shouldFix: false, reason: 'Auto-fix already in progress for this deploy' };
  }

  // Check if we have too many active auto-fixes
  if (activeAutoFixes.size >= MAX_ACTIVE_AUTOFIXES) {
    return { shouldFix: false, reason: 'Too many active auto-fixes' };
  }

  return { shouldFix: true };
}

/**
 * Start an auto-fix operation
 * @param {object} event - Build failure event
 * @param {function} createSession - Function to create Jules session
 * @param {function} sendMessage - Function to send message to session
 * @param {function} listSessions - Function to list active sessions (optional)
 */
export async function startAutoFix(event, createSession, sendMessage, listSessions) {
  const fixKey = `${event.serviceId}:${event.deployId}`;

  // Register this auto-fix
  const autoFixRecord = {
    startedAt: new Date().toISOString(),
    event,
    status: 'in_progress',
    sessionId: null
  };
  activeAutoFixes.set(fixKey, autoFixRecord);

  // Set timeout to clean up stale auto-fixes
  setTimeout(() => {
    const record = activeAutoFixes.get(fixKey);
    if (record && record.status === 'in_progress') {
      record.status = 'timeout';
      activeAutoFixes.delete(fixKey);
    }
  }, AUTOFIX_TIMEOUT);

  try {
    console.log(`[Auto-Fix] Starting for service ${event.serviceId}, deploy ${event.deployId}`);

    // 1. Get build logs
    const logs = await getBuildLogs(event.serviceId, event.deployId);
    console.log(`[Auto-Fix] Retrieved ${logs.totalLines} log lines, ${logs.errors.length} errors`);

    // 2. Analyze errors
    const analysis = analyzeErrors(logs);

    if (!analysis.hasActionableErrors) {
      autoFixRecord.status = 'no_actionable_errors';
      activeAutoFixes.delete(fixKey);
      return {
        success: false,
        reason: 'No actionable errors found in build logs',
        logs: logs.summary
      };
    }

    console.log(`[Auto-Fix] Found ${analysis.errors.length} actionable errors`);

    const source = extractSourceFromBranch(event.branch, event.serviceId);

    // 3. Try to find existing Jules session for this branch (Session Reuse Policy)
    let sessionResult;
    let reused = false;

    const reusableSession = await findReusableSession(event.branch, source, listSessions);

    if (reusableSession) {
      console.log(`[Auto-Fix] Reusing session ${reusableSession.name}`);
      const sessionId = reusableSession.name.split('/').pop() || reusableSession.id;

      const retryMessage = `[Auto-Fix Retry]
Build failed again on branch ${event.branch}.
New errors detected:
${analysis.promptContext}`;

      await sendMessage(sessionId, { prompt: retryMessage });

      sessionResult = { id: sessionId, name: reusableSession.name };
      reused = true;
    } else {
      console.log('[Auto-Fix] Creating new session');
      // Create a new session with the fix prompt
      sessionResult = await createSession({
        prompt: analysis.promptContext,
        source: source,
        title: `Auto-Fix: Build failure on ${event.branch}`,
        branch: event.branch,
        requirePlanApproval: false, // Auto-approve for auto-fix
        automationMode: 'AUTO_CREATE_PR'
      });
    }

    autoFixRecord.sessionId = sessionResult.name || sessionResult.id;
    autoFixRecord.status = reused ? 'session_reused' : 'session_created';

    console.log(`[Auto-Fix] ${reused ? 'Reused' : 'Created'} session ${autoFixRecord.sessionId}`);

    // 4. Send additional context if needed (only if not reused, or maybe append?)
    // If reused, we already sent the context in the retry message.
    if (!reused && logs.errors.length > 5) {
      await sendMessage(autoFixRecord.sessionId, {
        prompt: `Additional build errors:\n${logs.errors.slice(5, 10).map(e => e.message).join('\n')}`
      });
    }

    return {
      success: true,
      sessionId: autoFixRecord.sessionId,
      branch: event.branch,
      errorsFound: analysis.errors.length,
      reused,
      message: `Auto-fix ${reused ? 'continued' : 'started'} for build failure on branch ${event.branch}`
    };
  } catch (error) {
    autoFixRecord.status = 'failed';
    autoFixRecord.error = error.message;
    activeAutoFixes.delete(fixKey);

    console.error(`[Auto-Fix] Failed:`, error.message);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Find a reusable session based on branch, source, and state policy
 */
export async function findReusableSession(branch, source, listSessions) {
  if (!listSessions || typeof listSessions !== 'function') {
    return null;
  }

  try {
    const sessions = await listSessions();
    if (!sessions || !Array.isArray(sessions)) return null;

    // Filter sessions matching policy
    const matchingSessions = sessions.filter(session => {
      // Check state
      if (!REUSABLE_STATES.includes(session.state)) return false;

      // Check source
      const sessionSource = session.sourceContext?.source || session.source;
      if (sessionSource !== source) return false;

      // Check branch
      const sessionBranch = session.sourceContext?.githubRepoContext?.startingBranch;
      if (sessionBranch !== branch) return false;

      return true;
    });

    // Sort by creation time (descending) to get the most recent one
    matchingSessions.sort((a, b) => {
      const dateA = new Date(a.createTime || a.createdAt).getTime();
      const dateB = new Date(b.createTime || b.createdAt).getTime();
      return dateB - dateA;
    });

    return matchingSessions.length > 0 ? matchingSessions[0] : null;
  } catch (error) {
    console.warn('[Auto-Fix] Failed to find reusable session:', error.message);
    return null;
  }
}

/**
 * Extract source identifier from branch name
 * Jules branches typically have format: jules/fix-{owner}-{repo}-{issue}
 */
function extractSourceFromBranch(branch, serviceId) {
  // Try to extract from branch name
  const patterns = [
    /jules\/fix-([^-]+)-([^-]+)/,
    /jules\/feature-([^-]+)-([^-]+)/,
    /jules-([^-]+)-([^-]+)/
  ];

  for (const pattern of patterns) {
    const match = branch.match(pattern);
    if (match) {
      return `sources/github/${match[1]}/${match[2]}`;
    }
  }

  // Fallback: return a generic source (would need service mapping)
  return `sources/render/${serviceId}`;
}

/**
 * Get status of active auto-fixes
 */
export function getAutoFixStatus() {
  const fixes = [];
  for (const [key, record] of activeAutoFixes) {
    fixes.push({
      key,
      ...record
    });
  }

  return {
    enabled: autoFixEnabled,
    activeCount: activeAutoFixes.size,
    maxActive: MAX_ACTIVE_AUTOFIXES,
    monitoredServices: Array.from(monitoredServices),
    activeFixes: fixes
  };
}

/**
 * Enable or disable auto-fix
 * @param {boolean} enabled - Whether auto-fix should be enabled
 */
export function setAutoFixEnabled(enabled) {
  autoFixEnabled = enabled;
  return { success: true, enabled: autoFixEnabled };
}

/**
 * Add a service to the monitored list
 * @param {string} serviceId - Service ID to monitor
 */
export function addMonitoredService(serviceId) {
  if (!serviceId || !serviceId.startsWith('srv-')) {
    throw new Error('Invalid service ID format');
  }
  monitoredServices.add(serviceId);
  return { success: true, monitoredServices: Array.from(monitoredServices) };
}

/**
 * Remove a service from the monitored list
 * @param {string} serviceId - Service ID to remove
 */
export function removeMonitoredService(serviceId) {
  monitoredServices.delete(serviceId);
  return { success: true, monitoredServices: Array.from(monitoredServices) };
}

/**
 * Clear monitored services (monitor all)
 */
export function clearMonitoredServices() {
  monitoredServices.clear();
  return { success: true, message: 'Now monitoring all services' };
}

/**
 * Validate webhook timestamp to prevent replay attacks
 * @param {string} timestamp - ISO timestamp from webhook
 * @returns {boolean} - True if timestamp is within acceptable window
 */
function isValidWebhookTimestamp(timestamp) {
  if (!timestamp) return true; // Allow if no timestamp (backwards compatibility)

  const webhookTime = new Date(timestamp).getTime();
  if (isNaN(webhookTime)) return false;

  const now = Date.now();
  const drift = Math.abs(now - webhookTime);

  return drift <= MAX_WEBHOOK_TIMESTAMP_DRIFT;
}

/**
 * Check if webhook has already been processed (replay prevention)
 * @param {string} deployId - Deploy ID as unique webhook identifier
 * @returns {boolean} - True if this is a duplicate webhook
 */
function isDuplicateWebhook(deployId) {
  if (!deployId) return false;

  if (processedWebhooks.has(deployId)) {
    return true;
  }

  processedWebhooks.set(deployId, Date.now());
  return false;
}

/**
 * Sanitize branch name to prevent prompt injection
 * @param {string} branch - Raw branch name
 * @returns {string} - Sanitized branch name
 */
function sanitizeBranchName(branch) {
  if (!branch || typeof branch !== 'string') return 'unknown';

  // Remove any potential control characters or injection attempts
  // Allow only alphanumeric, hyphens, underscores, forward slashes
  return branch
    .replace(/[^a-zA-Z0-9\-_\/\.]/g, '')
    .substring(0, 100); // Limit length
}

/**
 * Handle incoming webhook request
 * @param {object} req - Express request
 * @param {function} createSession - Jules session creator
 * @param {function} sendMessage - Jules message sender
 * @param {function} listSessions - Function to list active sessions
 */
export async function handleWebhook(req, createSession, sendMessage, listSessions) {
  const { body, headers } = req;
  const signature = headers['x-render-signature'];

  // CRITICAL: Use rawBody if available (set by middleware), otherwise stringify
  // Note: For proper signature verification, the Express app should use
  // express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } })
  const rawBody = req.rawBody || (typeof body === 'string' ? body : JSON.stringify(body));

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('[Render Webhook] Signature verification failed');
    return { status: 401, error: 'Invalid webhook signature' };
  }

  // Parse event
  const parsed = parseWebhookEvent(body);

  if (!parsed.isRelevant) {
    return { status: 200, message: parsed.reason, processed: false };
  }

  // Security: Validate timestamp to prevent replay attacks with old webhooks
  if (!isValidWebhookTimestamp(parsed.event.timestamp)) {
    console.warn('[Render Webhook] Rejected webhook with stale timestamp:', parsed.event.timestamp);
    return { status: 400, error: 'Webhook timestamp outside acceptable window', processed: false };
  }

  // Security: Check for duplicate webhooks (replay prevention)
  if (isDuplicateWebhook(parsed.event.deployId)) {
    console.warn('[Render Webhook] Rejected duplicate webhook for deploy:', parsed.event.deployId);
    return { status: 200, message: 'Webhook already processed', processed: false };
  }

  // Security: Sanitize branch name before using in prompts
  parsed.event.branch = sanitizeBranchName(parsed.event.branch);

  // Handle successful deploy (Preview Notification)
  if (parsed.event.type === 'deploy_success') {
    console.log(`[Render Webhook] Success on ${parsed.event.branch}. URL: ${parsed.event.url}`);

    // Notify Telegram
    if (parsed.event.url) {
      await sendTelegramMessage(
        `✅ *Preview Lista: ${parsed.event.branch}*\n\n` +
        `🌐 *URL:* ${parsed.event.url}\n` +
        `📦 *Servicio:* \`${parsed.event.serviceId}\`\n\n` +
        `_Accede al entorno de pruebas al instante desde tu VPN o local._`
      ).catch(e => console.error('[Telegram] Error notifications:', e.message));

      // Save to project memory for Control Manager
      try {
        writeProjectMemory('PREVIEW_URLS.md', `| Branch | URL | Timestamp |\n|---|---|---|\n| ${parsed.event.branch} | [Open](${parsed.event.url}) | ${new Date().toISOString()} |`, true);
      } catch (e) {
        console.error('[Memory] Failed to save preview URL:', e.message);
      }
    }

    return { status: 200, message: 'Success event processed', processed: true };
  }

  // Check if we should auto-fix
  const check = shouldAutoFix(parsed.event);

  if (!check.shouldFix) {
    return { status: 200, message: check.reason, processed: false };
  }

  // Start auto-fix
  const result = await startAutoFix(parsed.event, createSession, sendMessage, listSessions);

  return {
    status: result.success ? 200 : 500,
    ...result,
    processed: true
  };
}

export default {
  verifyWebhookSignature,
  parseWebhookEvent,
  shouldAutoFix,
  startAutoFix,
  getAutoFixStatus,
  setAutoFixEnabled,
  addMonitoredService,
  removeMonitoredService,
  clearMonitoredServices,
  handleWebhook,
  startCleanupInterval,
  stopCleanupInterval
};
