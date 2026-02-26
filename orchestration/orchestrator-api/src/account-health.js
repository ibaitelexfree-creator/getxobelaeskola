import axios from 'axios';

/**
 * Account Health Tracker — Shared module for Jules API key management
 * Consolidates ACCOUNTS_MAP and provides circuit-breaker + validation.
 */

// ─── Centralized Account Map ───
export const ACCOUNTS_MAP = {
    'getxobelaeskola@gmail.com': process.env.JULES_API_KEY,
    'ibaitnt@gmail.com': process.env.JULES_API_KEY_2,
    'ibaitelexfree@gmail.com': process.env.JULES_API_KEY_3,
};

export const ACCOUNT_ROLES = {
    'getxobelaeskola@gmail.com': 'Lead Architect',
    'ibaitnt@gmail.com': 'Data Master',
    'ibaitelexfree@gmail.com': 'UI Engine',
};

const JULES_API_BASE = 'https://jules.googleapis.com/v1alpha';

// ─── Health State ───
const healthState = new Map();

function getEntry(email) {
    if (!healthState.has(email)) {
        healthState.set(email, {
            status: 'unknown',
            consecutiveFailures: 0,
            lastFailure: null,
            lastSuccess: null,
            lastFailCode: null,
        });
    }
    return healthState.get(email);
}

// ─── Circuit Breaker ───
const CIRCUIT_OPEN_THRESHOLD = 2;   // Open after 2 consecutive 401s
const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000; // Auto-recover after 5 min

export function recordSuccess(email) {
    const entry = getEntry(email);
    entry.status = 'healthy';
    entry.consecutiveFailures = 0;
    entry.lastSuccess = Date.now();
    entry.lastFailCode = null;
}

export function recordFailure(email, statusCode) {
    const entry = getEntry(email);
    entry.consecutiveFailures++;
    entry.lastFailure = Date.now();
    entry.lastFailCode = statusCode;

    if (statusCode === 401 && entry.consecutiveFailures >= CIRCUIT_OPEN_THRESHOLD) {
        entry.status = 'unhealthy';
        console.warn(`[AccountHealth] ⛔ Circuit OPEN for ${email} (${entry.consecutiveFailures} consecutive 401s)`);
    }
}

export function isHealthy(email) {
    const entry = getEntry(email);

    if (entry.status !== 'unhealthy') return true;

    // Auto-recover after cooldown
    if (entry.lastFailure && (Date.now() - entry.lastFailure) > CIRCUIT_COOLDOWN_MS) {
        entry.status = 'recovering';
        entry.consecutiveFailures = 0;
        console.log(`[AccountHealth] 🔄 Circuit half-open for ${email} (cooldown expired)`);
        return true;
    }

    return false;
}

export function getHealthReport() {
    const report = {};
    for (const email of Object.keys(ACCOUNTS_MAP)) {
        const entry = getEntry(email);
        const hasKey = !!ACCOUNTS_MAP[email];
        report[email] = {
            role: ACCOUNT_ROLES[email],
            hasKey,
            status: hasKey ? entry.status : 'no_key',
            consecutiveFailures: entry.consecutiveFailures,
            lastFailCode: entry.lastFailCode,
            lastSuccess: entry.lastSuccess ? new Date(entry.lastSuccess).toISOString() : null,
            lastFailure: entry.lastFailure ? new Date(entry.lastFailure).toISOString() : null,
        };
    }
    return report;
}

// ─── Auth Headers Builder ───
export function buildAuthHeaders(apiKey) {
    if (!apiKey) return {};
    const headers = { 'Content-Type': 'application/json' };

    // Always use X-Goog-Api-Key for Jules API regardless of format (AQ. works with it)
    if (apiKey.startsWith('ya29.')) {
        headers['Authorization'] = `Bearer ${apiKey}`; // Only generic OAuth tokens use Bearer
    } else {
        headers['X-Goog-Api-Key'] = apiKey;
    }

    return headers;
}

// ─── Preflight Validation ───
export async function validateApiKey(email) {
    const apiKey = ACCOUNTS_MAP[email];
    if (!apiKey) return { valid: false, email, reason: 'No key configured' };

    try {
        const headers = buildAuthHeaders(apiKey);
        await axios.get(`${JULES_API_BASE}/sessions?pageSize=1`, {
            headers,
            timeout: 10000
        });
        recordSuccess(email);
        return { valid: true, email };
    } catch (err) {
        const code = err.response?.status || 0;
        recordFailure(email, code);
        return { valid: false, email, reason: `HTTP ${code || err.message}` };
    }
}

export async function validateAllKeys() {
    const results = {};
    for (const email of Object.keys(ACCOUNTS_MAP)) {
        if (!ACCOUNTS_MAP[email]) {
            results[email] = { valid: false, reason: 'No key configured' };
            continue;
        }
        results[email] = await validateApiKey(email);
    }
    return results;
}

// ─── Find Healthy Alternate Account ───
export function findHealthyAlternate(excludeEmail) {
    for (const email of Object.keys(ACCOUNTS_MAP)) {
        if (email === excludeEmail) continue;
        if (!ACCOUNTS_MAP[email]) continue;
        if (isHealthy(email)) return email;
    }
    return null;
}
