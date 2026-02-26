/**
 * JulesPool — Invisible Load Balancer for 3 Jules Accounts
 *
 * Manages a pool of Jules accounts with:
 * - 100 tasks/day per account (300 total)
 * - Max concurrent sessions per account (controlled by ThermalGuard)
 * - Domain-based routing (A=backend, B=ui, C=qa)
 * - Automatic rotation when preferred account is full
 * - Persistent state across restarts
 *
 * Ibai NEVER sees which Jules is handling a task.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { query } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(__dirname, '..', 'state');
const STATE_FILE = join(STATE_DIR, 'pool-state.json');

const DAILY_LIMIT = 100;
const DEFAULT_MAX_CONCURRENT = 15;

const ACCOUNTS = {
<<<<<<< HEAD
    A: { id: 'A', name: 'Jules 1 (Architect)', email: 'getxobelaeskola@gmail.com', domain: 'architect', priority: 1 },
    B: { id: 'B', name: 'Jules 2 (Data)', email: 'ibaitnt@gmail.com', domain: 'data', priority: 2 },
    C: { id: 'C', name: 'Jules 3 (UI)', email: 'ibaitelexfree@gmail.com', domain: 'ui', priority: 3 }
};

const DOMAIN_MAP = {
    // Jules 1 (Architect) — architecture, contracts, QA, fixes
    architect: 'A',
    architecture: 'A',
    contract: 'A',
    types: 'A',
    config: 'A',
    qa: 'A',
    test: 'A',
    e2e: 'A',
    lint: 'A',
    audit: 'A',
    fix: 'A',
    security: 'A',
    docs: 'A',
    documentation: 'A',
    // Jules 2 (Data Master) — backend, DB, API
    backend: 'B',
    api: 'B',
    supabase: 'B',
    database: 'B',
    migration: 'B',
    query: 'B',
    rls: 'B',
    sql: 'B',
    // Jules 3 (UI Engine) — frontend, components, deploy
    ui: 'C',
    component: 'C',
    page: 'C',
    design: 'C',
    i18n: 'C',
    translation: 'C',
    style: 'C',
    css: 'C',
    animation: 'C',
    deploy: 'C',
    render: 'C'
=======
    A: { id: 'A', name: 'Jules A', domain: 'backend', priority: 1 },
    B: { id: 'B', name: 'Jules B', domain: 'ui', priority: 2 },
    C: { id: 'C', name: 'Jules C', domain: 'qa', priority: 3 }
};

const DOMAIN_MAP = {
    backend: 'A',
    api: 'A',
    supabase: 'A',
    database: 'A',
    migration: 'A',
    config: 'A',
    types: 'A',
    ui: 'B',
    component: 'B',
    page: 'B',
    design: 'B',
    i18n: 'B',
    translation: 'B',
    style: 'B',
    css: 'B',
    animation: 'B',
    qa: 'C',
    test: 'C',
    e2e: 'C',
    lint: 'C',
    audit: 'C',
    docs: 'C',
    documentation: 'C',
    security: 'C'
>>>>>>> pr-286
};

export class JulesPool extends EventEmitter {
    constructor(thermalGuard, options = {}) {
        super();
        this.thermalGuard = thermalGuard;
        this.maxConcurrentOverride = options.maxConcurrent || null;

        this.state = this._defaultState();
        this._initPool();
    }

    async _initPool() {
        this.state = await this._loadState();
        this._checkDateReset();

        // Schedule midnight reset
        this._scheduleMidnightReset();
    }

    /**
     * Acquire the best available Jules for a task
     * Returns account info or null if none available
     */
    acquire(task = {}) {
        this._checkDateReset();

        const maxConcurrent = this.maxConcurrentOverride ||
            (this.thermalGuard ? this.thermalGuard.getMaxConcurrent() : DEFAULT_MAX_CONCURRENT);

        // If thermalGuard says STOP, no Jules available
        if (maxConcurrent === 0) {
            this.emit('allThrottled', { reason: 'temperature', task });
            return null;
        }

        // Determine preferred account based on task domain
        const preferredId = this._detectDomain(task);
        const order = this._getSelectionOrder(preferredId);

        for (const accountId of order) {
            const account = this.state.accounts[accountId];

            if (account.dailyUsed >= DAILY_LIMIT) continue;
            if (account.active >= maxConcurrent) continue;
            if (account.paused) continue;

            // Acquire slot
            account.active++;
            account.dailyUsed++;
            account.lastUsed = Date.now();

            const sessionRef = `${accountId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

            if (!account.activeSessions) account.activeSessions = [];
            account.activeSessions.push({
                ref: sessionRef,
                task: task.title || task.description || 'unnamed',
                startedAt: Date.now()
            });

            this._saveState();

            this.emit('acquired', {
                accountId,
                sessionRef,
                task: task.title || 'unnamed',
                dailyUsed: account.dailyUsed,
                active: account.active,
                preferredWas: preferredId
            });

            return {
                accountId,
                sessionRef,
                account: ACCOUNTS[accountId],
                dailyUsed: account.dailyUsed,
                active: account.active
            };
        }

        // All accounts exhausted
        this.emit('poolExhausted', {
            reason: this._getExhaustionReason(maxConcurrent),
            task
        });
        return null;
    }

    /**
     * Release a Jules slot after task completion
     */
    release(accountId, sessionRef) {
        const account = this.state.accounts[accountId];
        if (!account) return false;

        account.active = Math.max(0, account.active - 1);

        if (account.activeSessions) {
            account.activeSessions = account.activeSessions.filter(s => s.ref !== sessionRef);
        }

        this._saveState();

        this.emit('released', { accountId, sessionRef, active: account.active });
        return true;
    }

    /**
     * Get full pool status (for /pool command)
     */
    getStatus() {
        this._checkDateReset();
        const maxConcurrent = this.thermalGuard ? this.thermalGuard.getMaxConcurrent() : DEFAULT_MAX_CONCURRENT;

        const totalUsed = Object.values(this.state.accounts).reduce((s, a) => s + a.dailyUsed, 0);
        const totalActive = Object.values(this.state.accounts).reduce((s, a) => s + a.active, 0);
        const totalLimit = DAILY_LIMIT * 3;

        return {
            date: this.state.date,
            totalUsed,
            totalLimit,
            totalActive,
            maxConcurrentPerAccount: maxConcurrent,
            clawdbotDelegated: this.state.clawdbotDelegated || 0,
            accounts: Object.entries(this.state.accounts).map(([id, a]) => ({
                id,
                domain: ACCOUNTS[id].domain,
                dailyUsed: a.dailyUsed,
                dailyLimit: DAILY_LIMIT,
                active: a.active,
                maxConcurrent,
                paused: !!a.paused,
                activeSessions: a.activeSessions || []
            }))
        };
    }

    /**
     * Get formatted status message for Telegram
     */
    getStatusMessage() {
        const s = this.getStatus();
        const pct = Math.round((s.totalUsed / s.totalLimit) * 100);
        const bar = this._progressBar(pct);

        const lines = [
            `📊 **Pool de Jules** — ${s.date}`,
            `${bar} ${s.totalUsed}/${s.totalLimit} tareas hoy (${pct}%)`,
            '',
            ...s.accounts.map(a => {
                const icon = a.paused ? '⏸️' : a.dailyUsed >= DAILY_LIMIT ? '🔴' : '🟢';
                return `${icon} **${a.id}** (${a.domain}): ${a.dailyUsed}/${a.dailyLimit} | ${a.active} activas`;
            }),
            '',
            `🤖 Delegadas a ClawdBot: ${s.clawdbotDelegated}`,
            `⚡ Max concurrentes/cuenta: ${s.maxConcurrentPerAccount}`
        ];

        return lines.join('\n');
    }

    /**
     * Pause a specific account
     */
    pauseAccount(accountId) {
        if (this.state.accounts[accountId]) {
            this.state.accounts[accountId].paused = true;
            this._saveState();
            return true;
        }
        return false;
    }

    /**
     * Resume a specific account
     */
    resumeAccount(accountId) {
        if (this.state.accounts[accountId]) {
            this.state.accounts[accountId].paused = false;
            this._saveState();
            return true;
        }
        return false;
    }

    /**
     * Pause all accounts
     */
    pauseAll() {
        Object.values(this.state.accounts).forEach(a => { a.paused = true; });
        this._saveState();
    }

    /**
     * Resume all accounts
     */
    resumeAll() {
        Object.values(this.state.accounts).forEach(a => { a.paused = false; });
        this._saveState();
    }

    /**
     * Increment ClawdBot delegation counter
     */
    recordClawdBotDelegation() {
        this.state.clawdbotDelegated = (this.state.clawdbotDelegated || 0) + 1;
        this._saveState();
    }

    /**
     * Detect task domain from keywords in task description/title
     */
    _detectDomain(task) {
        const text = `${task.title || ''} ${task.description || ''} ${task.domain || ''}`.toLowerCase();

        for (const [keyword, accountId] of Object.entries(DOMAIN_MAP)) {
            if (text.includes(keyword)) return accountId;
        }

        // Default: pick the least-used account today
        const accounts = Object.entries(this.state.accounts);
        accounts.sort((a, b) => a[1].dailyUsed - b[1].dailyUsed);
        return accounts[0][0];
    }

    /**
     * Get selection order starting with preferred account, then rotate
     */
    _getSelectionOrder(preferredId) {
        const ids = ['A', 'B', 'C'];
        const idx = ids.indexOf(preferredId);
        if (idx === -1) return ids;

        // Start with preferred, then round-robin
        return [...ids.slice(idx), ...ids.slice(0, idx)];
    }

    /**
     * Figure out why pool is exhausted
     */
    _getExhaustionReason(maxConcurrent) {
        const allAtDailyLimit = Object.values(this.state.accounts).every(a => a.dailyUsed >= DAILY_LIMIT);
        if (allAtDailyLimit) return 'daily_limit_reached';

        const allAtMaxConcurrent = Object.values(this.state.accounts).every(a => a.active >= maxConcurrent);
        if (allAtMaxConcurrent) return 'max_concurrent_reached';

        const allPaused = Object.values(this.state.accounts).every(a => a.paused);
        if (allPaused) return 'all_paused';

        return 'unknown';
    }

    _progressBar(pct) {
        const filled = Math.round(pct / 10);
        return '█'.repeat(filled) + '░'.repeat(10 - filled);
    }

    /**
     * Load state from database or disk
     */
    async _loadState() {
        // Try Database
        try {
            const results = await query('SELECT state_json FROM pool_state WHERE id = 1');
            if (results && results.length > 0) {
                console.log('[JulesPool] Loaded state from MySQL');
                return results[0].state_json;
            }
        } catch (err) {
            // Silently fail DB load
        }

        // Fallback to Disk
        try {
            if (existsSync(STATE_FILE)) {
                const data = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
                console.log('[JulesPool] Loaded state from disk');
                return data;
            }
        } catch (err) {
            // console.warn('[JulesPool] Disk load failed, using defaults:', err.message);
        }

        return this._defaultState();
    }

    _defaultState() {
        return {
            date: new Date().toISOString().split('T')[0],
            accounts: {
                A: { dailyUsed: 0, active: 0, paused: false, activeSessions: [] },
                B: { dailyUsed: 0, active: 0, paused: false, activeSessions: [] },
                C: { dailyUsed: 0, active: 0, paused: false, activeSessions: [] }
            },
            clawdbotDelegated: 0,
            lastThermalState: 'ideal'
        };
    }

    /**
     * Save state to database and disk
     */
    async _saveState() {
        const stateJson = JSON.stringify(this.state);

        // Save to Database
        try {
            await query(
                'INSERT INTO pool_state (id, state_json) VALUES (1, ?) ON DUPLICATE KEY UPDATE state_json = ?',
                [stateJson, stateJson]
            );
        } catch (err) {
            // Silently fail database save if not available
        }

        // Save to Disk (Backup)
        try {
            if (!existsSync(STATE_DIR)) {
                mkdirSync(STATE_DIR, { recursive: true });
            }
            writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
        } catch (err) {
            console.error('[JulesPool] Failed to save state to disk:', err.message);
        }
    }

    /**
     * Reset daily counters if date has changed
     */
    _checkDateReset() {
        const today = new Date().toISOString().split('T')[0];
        if (this.state.date !== today) {
            console.log(`[JulesPool] New day detected (${this.state.date} → ${today}). Resetting counters.`);

            Object.values(this.state.accounts).forEach(a => {
                a.dailyUsed = 0;
                // Don't reset active — those sessions may still be running
            });
            this.state.date = today;
            this.state.clawdbotDelegated = 0;
            this._saveState();

            this.emit('dailyReset', { date: today });
        }
    }

    /**
     * Schedule a reset at midnight
     */
    _scheduleMidnightReset() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);

        const msUntilMidnight = midnight.getTime() - now.getTime();

        setTimeout(() => {
            this._checkDateReset();
            this._scheduleMidnightReset(); // Reschedule for next day
        }, msUntilMidnight);
    }
}

export default JulesPool;
