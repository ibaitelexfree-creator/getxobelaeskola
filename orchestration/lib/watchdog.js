/**
 * AgentWatchdog — Loop Detection, Crash Recovery & Auto-Continue
 *
 * Monitors AI agent activity for:
 * - Infinite loops (repeated identical or similar outputs)
 * - Stalled sessions (no output for extended periods)
 * - Crashed processes (dead IDE / agent)
 *
 * Actions: auto-continue, kill-and-restart, pause on thermal events.
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ─── Configuration ───────────────────────────────────────────────
const DEFAULT_CONFIG = {
    // Loop detection
    bufferSize: 50,
    loopThreshold: 5,            // N similar messages to trigger loop
    loopWindowMs: 3 * 60 * 1000, // 3 minutes
    similarityThreshold: 0.6,    // 60% hash similarity = "same"

    // Stall detection
    stallTimeoutMs: 2 * 60 * 1000,  // 2 min no output = stalled
    killTimeoutMs: 5 * 60 * 1000,   // 5 min in loop = kill

    // Process monitoring
    pollIntervalMs: 30 * 1000,  // Check every 30s
    processNames: ['Antigravity', 'Code', 'Cursor', 'cursor'],

    // Auto-continue
    autoContinueEnabled: true,
    maxAutoRetries: 3,
    retryCooldownMs: 60 * 1000,
};

// ─── Agent States ────────────────────────────────────────────────
const STATE = {
    ACTIVE: 'ACTIVE',
    STALLED: 'STALLED',
    LOOPING: 'LOOPING',
    CRASHED: 'CRASHED',
    RECOVERING: 'RECOVERING',
    PAUSED: 'PAUSED',
};

/**
 * AgentWatchdog — The brain of the monitoring system
 */
export class AgentWatchdog extends EventEmitter {
    constructor(options = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...options };
        this.state = STATE.ACTIVE;
        this.previousState = null;

        // Circular buffer for output analysis
        this.outputBuffer = [];
        this.hashBuffer = [];

        // Timing
        this.lastOutputTime = Date.now();
        this.lastActionTime = null;
        this.loopStartTime = null;

        // Stats
        this.stats = {
            loopsDetected: 0,
            stallsDetected: 0,
            crashesRecovered: 0,
            autoContinues: 0,
            totalInterventions: 0,
            startedAt: new Date().toISOString(),
            history: [],
        };

        // Retry tracking
        this.retryCount = 0;
        this.lastRetryTime = null;

        // Timer handle
        this._timer = null;
        this._running = false;
    }

    // ─── Core: Start / Stop ──────────────────────────────────────

    start() {
        if (this._running) return;
        this._running = true;
        this.lastOutputTime = Date.now();
        this._log('info', 'Watchdog started', { config: this._safeConfig() });
        this.emit('started');

        this._timer = setInterval(() => this._tick(), this.config.pollIntervalMs);
        // Initial tick
        this._tick();
    }

    stop() {
        this._running = false;
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        this._log('info', 'Watchdog stopped');
        this.emit('stopped');
    }

    pause() {
        this._setState(STATE.PAUSED);
        this._log('info', 'Watchdog paused by user');
        this.emit('paused');
    }

    resume() {
        this._setState(STATE.ACTIVE);
        this.lastOutputTime = Date.now();
        this.retryCount = 0;
        this._log('info', 'Watchdog resumed');
        this.emit('resumed');
    }

    // ─── Core: Feed output from the agent ────────────────────────

    /**
     * Feed a new output line/message from the agent.
     * Call this every time the agent produces output.
     */
    feedOutput(message) {
        if (!message || typeof message !== 'string') return;
        if (this.state === STATE.PAUSED) return;

        const now = Date.now();
        const hash = this._hashMessage(message);

        // Add to circular buffers
        this.outputBuffer.push({ message, hash, timestamp: now });
        this.hashBuffer.push({ hash, timestamp: now });

        if (this.outputBuffer.length > this.config.bufferSize) {
            this.outputBuffer.shift();
        }
        if (this.hashBuffer.length > this.config.bufferSize) {
            this.hashBuffer.shift();
        }

        this.lastOutputTime = now;

        // Reset stall state if we get output
        if (this.state === STATE.STALLED) {
            this._setState(STATE.ACTIVE);
            this.retryCount = 0;
        }

        // Check for loops on every new message
        const loopResult = this._detectLoop();
        if (loopResult.isLoop) {
            this._handleLoopDetected(loopResult);
        } else if (this.state === STATE.LOOPING) {
            // Was looping but pattern broke — recovered
            this._setState(STATE.ACTIVE);
            this.loopStartTime = null;
            this.retryCount = 0;
            this._log('info', 'Loop pattern broken, agent recovered');
        }
    }

    // ─── Loop Detection Engine ───────────────────────────────────

    _detectLoop() {
        const now = Date.now();
        const windowStart = now - this.config.loopWindowMs;

        // Get recent hashes within the time window
        const recentHashes = this.hashBuffer
            .filter(h => h.timestamp >= windowStart)
            .map(h => h.hash);

        if (recentHashes.length < this.config.loopThreshold) {
            return { isLoop: false };
        }

        // Count hash frequency
        const freq = {};
        for (const hash of recentHashes) {
            freq[hash] = (freq[hash] || 0) + 1;
        }

        // Find the most repeated hash
        let maxHash = null;
        let maxCount = 0;
        for (const [hash, count] of Object.entries(freq)) {
            if (count > maxCount) {
                maxCount = count;
                maxHash = hash;
            }
        }

        // Check if dominant hash exceeds threshold
        const dominanceRatio = maxCount / recentHashes.length;
        const isLoop = maxCount >= this.config.loopThreshold &&
            dominanceRatio >= this.config.similarityThreshold;

        return {
            isLoop,
            dominantHash: maxHash,
            repeatCount: maxCount,
            totalMessages: recentHashes.length,
            dominanceRatio: Math.round(dominanceRatio * 100),
            sample: isLoop
                ? this.outputBuffer.find(o => o.hash === maxHash)?.message?.substring(0, 100)
                : null,
        };
    }

    _handleLoopDetected(loopResult) {
        if (this.state === STATE.LOOPING) {
            // Already in loop state — check if time to kill
            const loopDuration = Date.now() - (this.loopStartTime || Date.now());
            if (loopDuration >= this.config.killTimeoutMs) {
                this._killAndRestart(loopResult);
            }
            return;
        }

        // First detection
        this._setState(STATE.LOOPING);
        this.loopStartTime = Date.now();
        this.stats.loopsDetected++;
        this.stats.totalInterventions++;

        this._logHistory('LOOP_DETECTED', {
            repeatCount: loopResult.repeatCount,
            dominanceRatio: loopResult.dominanceRatio,
            sample: loopResult.sample,
        });

        this._log('warn', `Loop detected: ${loopResult.repeatCount} similar messages (${loopResult.dominanceRatio}% dominated)`, {
            sample: loopResult.sample,
        });

        this.emit('loopDetected', loopResult);
    }

    // ─── Stall Detection ────────────────────────────────────────

    _checkStall() {
        if (this.state === STATE.PAUSED || this.state === STATE.RECOVERING) return;

        const timeSinceOutput = Date.now() - this.lastOutputTime;

        if (timeSinceOutput >= this.config.stallTimeoutMs && this.state !== STATE.STALLED) {
            this._setState(STATE.STALLED);
            this.stats.stallsDetected++;
            this.stats.totalInterventions++;

            this._logHistory('STALL_DETECTED', {
                silentForMs: timeSinceOutput,
                silentForHuman: this._humanDuration(timeSinceOutput),
            });

            this._log('warn', `Agent stalled: no output for ${this._humanDuration(timeSinceOutput)}`);
            this.emit('stallDetected', { silentForMs: timeSinceOutput });

            // Auto-continue if enabled
            if (this.config.autoContinueEnabled) {
                this._autoContinue();
            }
        }
    }

    // ─── Process Health Check ────────────────────────────────────

    async _checkProcessAlive() {
        if (this.state === STATE.PAUSED || this.state === STATE.RECOVERING) return;

        try {
            const isAlive = await this._isProcessRunning();
            if (!isAlive && this.state !== STATE.CRASHED) {
                this._setState(STATE.CRASHED);
                this.stats.crashesRecovered++;
                this.stats.totalInterventions++;

                this._logHistory('CRASH_DETECTED', {
                    processNames: this.config.processNames,
                });

                this._log('error', 'Agent process not found! Initiating recovery...');
                this.emit('crashDetected');

                // Attempt restart
                await this._restartProcess();
            }
        } catch (err) {
            this._log('error', 'Process health check failed', { error: err.message });
        }
    }

    async _isProcessRunning() {
        const names = this.config.processNames;
        const checks = names.map(name =>
            `(Get-Process -Name "${name}" -ErrorAction SilentlyContinue) -ne $null`
        );
        const psCommand = checks.join(' -or ');

        try {
            const { stdout } = await execAsync(
                `powershell -NoProfile -Command "if (${psCommand}) { 'ALIVE' } else { 'DEAD' }"`,
                { timeout: 10000 }
            );
            return stdout.trim() === 'ALIVE';
        } catch {
            return false;
        }
    }

    async _restartProcess() {
        this._setState(STATE.RECOVERING);
        this._log('info', 'Attempting to restart Antigravity...');
        this.emit('recovering');

        try {
            // Try to launch Antigravity via the most common methods
            const launchCommands = [
                'Start-Process "Antigravity" -ErrorAction SilentlyContinue',
                'Start-Process "cursor" -ErrorAction SilentlyContinue',
                'Start-Process "code" -ErrorAction SilentlyContinue',
            ];

            for (const cmd of launchCommands) {
                try {
                    await execAsync(`powershell -NoProfile -Command "${cmd}"`, { timeout: 15000 });
                    // Wait a bit for the process to start
                    await new Promise(r => setTimeout(r, 5000));
                    const alive = await this._isProcessRunning();
                    if (alive) {
                        this._setState(STATE.ACTIVE);
                        this.lastOutputTime = Date.now();
                        this.retryCount = 0;
                        this._log('info', 'Process restarted successfully');
                        this._logHistory('PROCESS_RESTARTED', { command: cmd });
                        this.emit('processRestarted', { command: cmd });
                        return true;
                    }
                } catch {
                    // Try next command
                }
            }

            this._log('error', 'All restart attempts failed');
            this.emit('restartFailed');
            return false;
        } catch (err) {
            this._log('error', 'Restart failed', { error: err.message });
            this.emit('restartFailed', { error: err.message });
            return false;
        }
    }

    // ─── Auto-Continue ──────────────────────────────────────────

    async _autoContinue() {
        if (this.retryCount >= this.config.maxAutoRetries) {
            this._log('warn', `Max auto-retries (${this.config.maxAutoRetries}) reached. Killing agent.`);
            this._killAndRestart({ reason: 'max_retries_exceeded' });
            return;
        }

        // Cooldown check
        if (this.lastRetryTime && Date.now() - this.lastRetryTime < this.config.retryCooldownMs) {
            return;
        }

        this.retryCount++;
        this.lastRetryTime = Date.now();
        this.stats.autoContinues++;

        this._logHistory('AUTO_CONTINUE', { attempt: this.retryCount });
        this._log('info', `Auto-continue attempt ${this.retryCount}/${this.config.maxAutoRetries}`);

        try {
            // Send Enter key to the active IDE window via PowerShell
            await execAsync(
                `powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; ` +
                `$procs = Get-Process -Name 'Antigravity','cursor','Code' -ErrorAction SilentlyContinue; ` +
                `if ($procs) { ` +
                `  $wshell = New-Object -ComObject WScript.Shell; ` +
                `  $wshell.AppActivate($procs[0].Id); ` +
                `  Start-Sleep -Milliseconds 500; ` +
                `  [System.Windows.Forms.SendKeys]::SendWait('{ENTER}'); ` +
                `}"`,
                { timeout: 10000 }
            );

            this.emit('autoContinueSent', { attempt: this.retryCount });
        } catch (err) {
            this._log('error', 'Auto-continue SendKeys failed', { error: err.message });
        }
    }

    // ─── Kill & Restart ─────────────────────────────────────────

    async _killAndRestart(context = {}) {
        this._setState(STATE.RECOVERING);
        this._log('warn', 'Killing and restarting agent', context);

        this._logHistory('KILL_AND_RESTART', context);
        this.emit('killAndRestart', context);

        try {
            // Kill the process
            for (const name of this.config.processNames) {
                await execAsync(
                    `powershell -NoProfile -Command "Stop-Process -Name '${name}' -Force -ErrorAction SilentlyContinue"`,
                    { timeout: 10000 }
                ).catch(() => { });
            }

            // Clear buffers
            this.outputBuffer = [];
            this.hashBuffer = [];
            this.loopStartTime = null;
            this.retryCount = 0;

            // Wait before restart
            await new Promise(r => setTimeout(r, 10000));

            // Restart
            await this._restartProcess();
        } catch (err) {
            this._log('error', 'Kill and restart failed', { error: err.message });
            this.emit('restartFailed', { error: err.message });
        }
    }

    // ─── Main Tick ──────────────────────────────────────────────

    async _tick() {
        if (!this._running || this.state === STATE.PAUSED) return;

        try {
            this._checkStall();
            await this._checkProcessAlive();

            // Re-check loop timeout if currently looping
            if (this.state === STATE.LOOPING && this.loopStartTime) {
                const loopDuration = Date.now() - this.loopStartTime;
                if (loopDuration >= this.config.killTimeoutMs) {
                    this._killAndRestart({ reason: 'loop_timeout', durationMs: loopDuration });
                }
            }
        } catch (err) {
            this._log('error', 'Tick error', { error: err.message });
        }
    }

    // ─── Hashing ────────────────────────────────────────────────

    _hashMessage(message) {
        // Normalize: lowercase, remove extra whitespace, remove timestamps/numbers
        const normalized = message
            .toLowerCase()
            .replace(/\d+/g, '#')
            .replace(/\s+/g, ' ')
            .trim();
        return createHash('md5').update(normalized).digest('hex').substring(0, 12);
    }

    // ─── State Machine ─────────────────────────────────────────

    _setState(newState) {
        if (this.state === newState) return;
        this.previousState = this.state;
        this.state = newState;
        this._log('info', `State: ${this.previousState} → ${newState}`);
        this.emit('stateChange', {
            from: this.previousState,
            to: newState,
            timestamp: new Date().toISOString(),
        });
    }

    // ─── Status / Public API ────────────────────────────────────

    getStatus() {
        const now = Date.now();
        return {
            state: this.state,
            running: this._running,
            uptime: this._humanDuration(now - new Date(this.stats.startedAt).getTime()),
            lastOutput: this._humanDuration(now - this.lastOutputTime) + ' ago',
            bufferSize: this.outputBuffer.length,
            retryCount: this.retryCount,
            stats: { ...this.stats, history: undefined },
            recentHistory: this.stats.history.slice(-10),
        };
    }

    getFullHistory() {
        return [...this.stats.history];
    }

    // ─── Helpers ────────────────────────────────────────────────

    _logHistory(action, details = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            state: this.state,
            ...details,
        };
        this.stats.history.push(entry);

        // Keep history bounded
        if (this.stats.history.length > 200) {
            this.stats.history = this.stats.history.slice(-100);
        }
    }

    _log(level, message, context = {}) {
        const prefix = '[Watchdog]';
        const stateTag = `[${this.state}]`;
        const msg = `${prefix} ${stateTag} ${message}`;

        if (level === 'error') console.error(msg, Object.keys(context).length ? context : '');
        else if (level === 'warn') console.warn(msg, Object.keys(context).length ? context : '');
        else console.log(msg, Object.keys(context).length ? context : '');
    }

    _humanDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${Math.round(ms / 1000)}s`;
        if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
        return `${(ms / 3600000).toFixed(1)}h`;
    }

    _safeConfig() {
        const { processNames, ...rest } = this.config;
        return { ...rest, processNames: processNames.length + ' names' };
    }
}

// ─── Standalone CLI test ────────────────────────────────────────
if (process.argv.includes('--test')) {
    const wd = new AgentWatchdog({ pollIntervalMs: 5000 });

    wd.on('stateChange', e => console.log(`  🔄 ${e.from} → ${e.to}`));
    wd.on('loopDetected', e => console.log(`  🔁 Loop! ${e.repeatCount}x (${e.dominanceRatio}%)`));
    wd.on('stallDetected', () => console.log('  ⏸️ Stall detected'));
    wd.on('autoContinueSent', e => console.log(`  ▶️ Auto-continue #${e.attempt}`));

    console.log('[Test] Starting watchdog...');
    wd.start();

    // Simulate a loop
    console.log('[Test] Simulating loop (10 identical messages)...');
    for (let i = 0; i < 10; i++) {
        wd.feedOutput('Error: Cannot find module ./foo');
    }
    console.log('[Test] Status:', JSON.stringify(wd.getStatus(), null, 2));

    setTimeout(() => {
        wd.stop();
        console.log('[Test] Done.');
    }, 6000);
}

export default AgentWatchdog;
